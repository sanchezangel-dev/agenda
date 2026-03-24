import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient.js';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import HistorialPagos from '../components/HistorialPagos';
import '../styles/Pagos.css';

const Pagos = () => {
    const [mesesPendientes, setMesesPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Estados para el Modal de Liquidación
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mesAAsignar, setMesAAsignar] = useState(null); 
    const [metodoPago, setMetodoPago] = useState('Transferencia');
    const [notas, setNotas] = useState('');

    useEffect(() => {
        cargarLiquidaciones();
    }, []);

    const cargarLiquidaciones = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('atenciones')
                .select('id, montoCentro, fecha')
                .eq('liquidado', false)
                .order('fecha', { ascending: false });

            if (error) throw error;

            if (data) {
                const agrupado = data.reduce((acc, atencion) => {
                    const fecha = new Date(atencion.fecha);
                    const mesAnio = fecha.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
                    
                    if (!acc[mesAnio]) {
                        acc[mesAnio] = { 
                            nombre: mesAnio, 
                            total: 0, 
                            ids: [], 
                            esMesActual: false 
                        };
                    }
                    
                    acc[mesAnio].total += atencion.montoCentro || 0;
                    acc[mesAnio].ids.push(atencion.id);
                    
                    const hoy = new Date();
                    if (fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()) {
                        acc[mesAnio].esMesActual = true;
                    }
                    
                    return acc;
                }, {});

                setMesesPendientes(Object.values(agrupado));
            }
        } catch (error) {
            console.error("Error al cargar liquidaciones:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAbrirModal = (ids, monto, periodo) => {
        setMesAAsignar({ ids, monto, periodo });
        setIsModalOpen(true);
    };

    // --- ESTA ES LA FUNCIÓN QUE CORREGIMOS ---
    const confirmarLiquidacionFinal = async () => {
        try {
            const { ids, monto, periodo } = mesAAsignar;

            // 1. Insertar registro en tabla de pagos (Usando 'metodopago' en minúscula)
            const { error: errorPago } = await supabase
                .from('pagos')
                .insert([{
                    fecha: new Date().toISOString(),
                    monto: monto,
                    periodo: periodo,
                    metodopago: metodoPago, 
                    notas: notas || `Liquidación de ${periodo}`
                }]);

            if (errorPago) throw errorPago;

            // 2. Actualizar atenciones a liquidado: true
            const { error: errorUpdate } = await supabase
                .from('atenciones')
                .update({ liquidado: true })
                .in('id', ids);

            if (errorUpdate) throw errorUpdate;

            alert("✅ Pago registrado con éxito.");
            setIsModalOpen(false); 
            setNotas(''); 
            cargarLiquidaciones(); 
            
            // Forzamos un refresco suave para que el Historial se entere del nuevo pago
            if (window.fetchHistorial) window.fetchHistorial();

        } catch (error) {
            alert("❌ Error al procesar el pago");
            console.error(error);
        }
    };
    // ------------------------------------------

    return (
        <div className="pagos-container"> 
            <header className="dashboard-header flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Liquidaciones al Centro <i className="fa-solid fa-wallet"></i></h1>
                <Button variant="ghost" onClick={() => navigate('/')}>Volver</Button>
            </header>

            {loading ? (
                <p>Cargando montos...</p>
            ) : mesesPendientes.length === 0 ? (
                <div className="resumen-pago-card status-aldia text-center">
                    <p className="p-4 text-green-700 font-bold">✅ Estás al día con el centro.</p>
                </div>
            ) : (
                mesesPendientes.map((mes) => (
                    <div 
                        key={mes.nombre} 
                        className={`resumen-pago-card ${!mes.esMesActual ? 'mes-cerrado' : ''}`}
                    >
                        <div className="resumen-info">
                            <span className="resumen-label">
                                {mes.esMesActual ? 'Mes en curso' : 'Mes cerrado pendiente'}
                            </span>
                            <h3 className="capitalize text-lg font-bold text-purple-900">{mes.nombre}</h3>
                            <h2>${mes.total.toLocaleString('es-AR')}</h2>
                            
                            <div className={`pago-status-badge ${mes.esMesActual ? 'status-curso' : 'status-pendiente'}`}>
                                {mes.esMesActual ? '● Acumulando' : '● Pendiente de pago'}
                            </div>
                        </div>

                        <Button
                            variant="payment"
                            size="large"
                            onClick={() => handleAbrirModal(mes.ids, mes.total, mes.nombre)}
                        >
                            {mes.esMesActual ? 'Liquidación Parcial' : 'Liquidar Mes'}
                        </Button>
                    </div>
                ))
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Detalle de Liquidación</h3>
                        <p className="modal-periodo">Periodo: <strong>{mesAAsignar?.periodo}</strong></p>
                        
                        <div className="modal-field">
                            <label>Monto a Registrar:</label>
                            <input type="text" value={`$${mesAAsignar?.monto.toLocaleString('es-AR')}`} disabled className="bg-gray-100" />
                        </div>

                        <div className="modal-field">
                            <label>Medio de Pago:</label>
                            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Mercado Pago">Mercado Pago</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>Notas (Opcional):</label>
                            <textarea 
                                placeholder="Ej: Pago realizado por transferencia bancaria..." 
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancelar" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                            <Button variant="payment" onClick={confirmarLiquidacionFinal}>Confirmar Pago</Button>
                        </div>
                    </div>
                </div>
            )}

            <section className="historial-seccion mt-12">
                <h3 className="text-xl font-bold mb-4">Pagos Históricos Realizados</h3>
                <HistorialPagos />
            </section>
        </div>
    );
};

export default Pagos;