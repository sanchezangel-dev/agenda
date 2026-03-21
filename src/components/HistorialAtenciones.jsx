import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../styles/HistorialAtenciones.css';
import Button from '../components/Button';

export default function HistorialAtenciones() {
    const [atenciones, setAtenciones] = useState([]);
    const [filaExpandida, setFilaExpandida] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAtenciones();
    }, []);

    const fetchAtenciones = async () => {
        const { data } = await supabase
            .from('atenciones')
            .select('id, fecha, montoTotal, montoPaciente, metodoPago, notas, pacientes(nombre)')
            .order('fecha', { ascending: false });

        setAtenciones(data || []);
    };

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

    return (
        <div className="historial-container">
            <h3>Historial de Atenciones</h3>
            <table className="historial-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Paciente</th>
                        <th>Total</th>
                        <th>Tus Honorarios</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {atenciones.map((a) => (
                        <React.Fragment key={a.id}>
                            <tr>
                                <td>{a.fecha}</td>
                                <td>{a.pacientes?.nombre}</td>
                                <td>${a.montoTotal}</td>
                                <td><strong>${a.montoPaciente}</strong></td>
                                <td>
                                    <button className="btn-detalle" onClick={() => toggleFila(a.id)}>
                                        {filaExpandida === a.id ? 'Cerrar' : 'Detalles'}
                                    </button>
                                </td>
                            </tr>
                            {filaExpandida === a.id && (
                                <tr className="fila-notas">
                                    <td colSpan="5">
                                        <div className="notas-container">
                                            <p><strong>Método:</strong> {a.metodoPago}</p>
                                            <p><strong>Notas:</strong> {a.notas || 'Sin notas.'}</p>
                                            <div className="acciones-container">
                                                <Button onClick={() => navigate(`/editar/${a.id}`)} variant="secondary">Editar</Button>
                                                <Button onClick={() => handleEliminar(a.id)} variant="danger">Eliminar</Button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}