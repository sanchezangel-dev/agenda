import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../styles/HistorialAtenciones.css';
import Button from '../components/Button';
import BadgePaciente from '../components/BadgePaciente.jsx';

export default function HistorialAtenciones() {
    const [atenciones, setAtenciones] = useState([]);
    const [filaExpandida, setFilaExpandida] = useState(null);
    
    // Estados para los filtros
    const [mesFiltro, setMesFiltro] = useState(new Date().getMonth());
    const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());
    const [verTodoElAnio, setVerTodoElAnio] = useState(false);

    const navigate = useNavigate();

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    useEffect(() => {
        fetchAtenciones();
    }, []);

    const fetchAtenciones = async () => {
        const { data } = await supabase
            .from('atenciones')
            .select(`
                id, fecha, montoTotal, montoPaciente, montoCentro, metodoPago, notas, es_becado, 
                comision_porcentaje,
                pacientes(nombre, etiqueta, es_becado)
            `) 
            .order('fecha', { ascending: false });

        setAtenciones(data || []);
    };

    const atencionesFiltradas = useMemo(() => {
        return atenciones.filter(a => {
            const fechaAtencion = new Date(a.fecha + 'T00:00:00');
            const coincideAnio = fechaAtencion.getFullYear() === Number(anioFiltro);
            const coincideMes = fechaAtencion.getMonth() === Number(mesFiltro);

            if (verTodoElAnio) {
                return coincideAnio;
            }
            return coincideAnio && coincideMes;
        });
    }, [atenciones, mesFiltro, anioFiltro, verTodoElAnio]);

    const toggleFila = (id) => {
        setFilaExpandida(filaExpandida === id ? null : id);
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este registro?")) {
            const { error } = await supabase.from('atenciones').delete().eq('id', id);
            if (error) alert("Error: " + error.message);
            else setAtenciones(atenciones.filter(a => a.id !== id));
        }
    };

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const [year, month, day] = fechaStr.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="historial-container">
            <div className="header-historial-filtros">
                <h3>Historial de Atenciones</h3>
                
                <div className="controles-filtros">
                    <select 
                        value={anioFiltro} 
                        onChange={(e) => setAnioFiltro(e.target.value)}
                        className="select-filtro"
                    >
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                    </select>

                    <select 
                        value={mesFiltro} 
                        onChange={(e) => setMesFiltro(e.target.value)}
                        className="select-filtro"
                        disabled={verTodoElAnio}
                    >
                        {meses.map((nombre, index) => (
                            <option key={index} value={index}>{nombre}</option>
                        ))}
                    </select>

                    <button 
                        className={`btn-ver-todo ${verTodoElAnio ? 'active' : ''}`}
                        onClick={() => setVerTodoElAnio(!verTodoElAnio)}
                    >
                        {verTodoElAnio ? 'Ver por Mes' : 'Ver todo el Año'}
                    </button>
                </div>
            </div>

            <table className="historial-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Paciente</th>
                        <th>Total</th>
                        <th>Centro</th> 
                        <th>Tus Honorarios</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {atencionesFiltradas.length > 0 ? (
                        atencionesFiltradas.map((a) => (
                            <React.Fragment key={a.id}>
                                <tr className={a.es_becado ? "fila-becada" : ""}>
                                    <td data-label="Fecha">{formatearFecha(a.fecha)}</td>
                                    <td data-label="Paciente">
                                        {a.pacientes?.nombre} 
                                        <BadgePaciente paciente={a.pacientes} />
                                    </td>
                                    <td data-label="Total">${a.montoTotal}</td>
                                    <td data-label="Centro" style={{ color: '#888', fontSize: '0.9rem' }}>
                                        <span>${a.montoCentro}</span>
                                        <span className="porcentaje-label">({a.comision_porcentaje}%)</span>
                                    </td>
                                    <td data-label="Honorarios"><strong>${a.montoPaciente}</strong></td>
                                    <td data-label="Acciones">
                                        <button className="btn-detalle" onClick={() => toggleFila(a.id)}>
                                            {filaExpandida === a.id ? 'Cerrar' : 'Detalles'}
                                        </button>
                                    </td>
                                </tr>
                                {filaExpandida === a.id && (
                                    <tr className="fila-notas">
                                        <td colSpan="6"> {/* Incrementado colSpan a 6 */}
                                            <div className="notas-container">
                                                <div className="info-detalles">
                                                    <p><strong>Método:</strong> {a.metodoPago}</p>
                                                    <p>
                                                        <strong>Aporte al Centro:</strong> ${a.montoCentro} 
                                                        <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '5px' }}>
                                                            ({a.comision_porcentaje}% aplicado)
                                                        </span>
                                                    </p>
                                                    <p><strong>Notas:</strong> {a.notas || 'Sin notas.'}</p>
                                                </div>
                                                <div className="acciones-container">
                                                    <Button onClick={() => navigate(`/editar/${a.id}`)} variant="secondary">Editar</Button>
                                                    <Button onClick={() => handleEliminar(a.id)} variant="danger">Eliminar</Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="sin-datos">
                                No hay registros para {verTodoElAnio ? anioFiltro : `${meses[mesFiltro]} de ${anioFiltro}`}.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}