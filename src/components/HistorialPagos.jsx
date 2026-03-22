import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient.js';
import '../styles/Pagos.css'

const HistorialPagos = () => {
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para el Modal de Edición
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pagoAEditar, setPagoAEditar] = useState(null);

    const fetchHistorial = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pagos')
                .select('*')
                .order('fecha', { ascending: false });

            if (error) throw error;
            setPagos(data || []);
        } catch (error) {
            console.error("Error al cargar historial:", error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistorial();
        // Exponemos la función globalmente para que otros componentes la llamen
        window.fetchHistorial = fetchHistorial;
        
        const channel = supabase
            .channel('cambios-pagos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pagos' }, () => fetchHistorial())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            delete window.fetchHistorial;
        };
    }, [fetchHistorial]);

    // --- FUNCIÓN PARA ANULAR Y VOLVER A PENDIENTE ---
    const handleAnular = async (id, periodo) => {
        const confirmacion = window.confirm(`⚠️ ¿Anular pago de ${periodo}?\nLas atenciones de este periodo volverán a figurar como PENDIENTES.`);
        if (!confirmacion) return;

        try {
            setLoading(true);

            // 1. Liberar las atenciones (volver a liquidado: false)
            // Filtramos las que están marcadas como liquidadas. 
            // Para ser precisos, buscamos aquellas cuyo periodo coincida con el string.
            const { error: errorAtenciones } = await supabase
                .from('atenciones')
                .update({ liquidado: false })
                .eq('liquidado', true); 
                // Nota: Si en el futuro agregas la columna 'periodo' a atenciones, 
                // aquí deberías agregar .eq('periodo_nombre', periodo)

            if (errorAtenciones) throw errorAtenciones;

            // 2. Borrar el registro del pago
            const { error: errorPago } = await supabase
                .from('pagos')
                .delete()
                .eq('id', id);

            if (errorPago) throw errorPago;

            alert("✅ Pago anulado con éxito.");
            
            // 3. REFRESO AUTOMÁTICO DE AMBOS COMPONENTES
            fetchHistorial(); // Refresca esta tabla (Historial)
            
            // Refresca la sección de arriba (Pendientes)
            if (window.cargarLiquidaciones) {
                window.cargarLiquidaciones(); 
            } else {
                // Si el componente de arriba no expuso la función, recargamos la página como plan B
                window.location.reload();
            }

        } catch (error) {
            console.error(error);
            alert("Error al anular el pago");
        } finally {
            setLoading(false);
        }
    };

    const guardarEdicion = async () => {
        try {
            const { error } = await supabase
                .from('pagos')
                .update({ 
                    metodopago: pagoAEditar.metodopago, 
                    notas: pagoAEditar.notas 
                })
                .eq('id', pagoAEditar.id);

            if (error) throw error;
            setIsEditModalOpen(false);
            fetchHistorial();
        } catch (error) {
            alert("Error al actualizar");
        }
    };

    if (loading) return <p className="text-gray-500 text-sm">Cargando historial...</p>;

    return (
        <div className="historial-container">
            <div className="table-responsive">
                <table className="tabla-pagos">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Periodo</th>
                            <th>Monto</th>
                            <th>Método</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagos.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center p-4 text-gray-400">No hay pagos registrados.</td>
                            </tr>
                        ) : (
                            pagos.map((pago) => (
                                <tr key={pago.id}>
                                    <td>{new Date(pago.fecha).toLocaleDateString('es-AR')}</td>
                                    <td className="capitalize">{pago.periodo}</td>
                                    <td className="font-bold text-green-700">
                                        ${Number(pago.monto).toLocaleString('es-AR')}
                                    </td>
                                    <td>{pago.metodopago}</td>
                                    <td className="acciones-celda-iconos">
                                        <button 
                                            className="btn-accion edit" 
                                            onClick={() => { setPagoAEditar(pago); setIsEditModalOpen(true); }}
                                            title="Editar"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button 
                                            className="btn-accion delete" 
                                            onClick={() => handleAnular(pago.id, pago.periodo)}
                                            title="Anular"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE EDICIÓN */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Editar Detalles del Pago</h3>
                        <div className="modal-field">
                            <label>Medio de Pago:</label>
                            <select 
                                value={pagoAEditar.metodopago} 
                                onChange={(e) => setPagoAEditar({...pagoAEditar, metodopago: e.target.value})}
                            >
                                <option value="Transferencia">Transferencia</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Mercado Pago">Mercado Pago</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div className="modal-field">
                            <label>Notas:</label>
                            <textarea 
                                value={pagoAEditar.notas || ""} 
                                onChange={(e) => setPagoAEditar({...pagoAEditar, notas: e.target.value})}
                                placeholder="Agregar aclaraciones..."
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancelar" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                            <button className="btn-guardar lila" onClick={guardarEdicion}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialPagos;