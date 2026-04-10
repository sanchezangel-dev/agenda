import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient.js';
import { useNavigate } from 'react-router-dom';
import '../styles/Pacientes.css';
import Button from '../components/Button.jsx';

export default function Pacientes() {
    const [listaPacientes, setListaPacientes] = useState([]);
    const [filaAbierta, setFilaAbierta] = useState(null); 
    const navigate = useNavigate();

    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return "N/A";
        const hoy = new Date();
        const cumple = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        const m = hoy.getMonth() - cumple.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
            edad--;
        }
        return edad;
    };

    const fetchPacientes = async () => {
        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) console.error('Error:', error);
        else setListaPacientes(data || []);
    };

    const eliminarPaciente = async (id) => {
        const confirmar = window.confirm("¿Estás seguro de eliminar este paciente?");
        if (confirmar) {
            const { error } = await supabase.from('pacientes').delete().eq('id', id);
            if (!error) fetchPacientes();
        }
    };

    useEffect(() => {
        fetchPacientes();
    }, []);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Pacientes <i className="fa-solid fa-address-book"></i></h1>
                <Button variant="ghost" onClick={() => navigate('/')}>Volver</Button>
            </header>

            <main className="dashboard-content">
                <Button
                    variant="primary"
                    onClick={() => navigate(`/nuevo-paciente`)} 
                    style={{ marginBottom: '20px' }}
                >
                    + Nuevo Paciente
                </Button>

                <table className="tabla-pacientes">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Edad</th>
                            <th>Celular</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listaPacientes.map((p) => (
                            <React.Fragment key={p.id}>
                                {/* Agregamos la clase fila-becada si p.es_becado es true */}
                                <tr className={p.es_becado ? "fila-becada" : ""}>
                                    <td data-label="Nombre">
                                        {p.nombre}
                                        {/* Badge verde al lado del nombre en la lista principal */}
                                        {p.es_becado && <span className="badge-beca-tabla">Becado</span>}
                                    </td>
                                    <td data-label="Edad">{calcularEdad(p.nacimiento)} años</td>
                                    <td data-label="Celular">{p.celular}</td>
                                    <td data-label="Acciones">
                                        <Button
                                            variant="primary"
                                            onClick={() => setFilaAbierta(filaAbierta === p.id ? null : p.id)}
                                        >
                                            {filaAbierta === p.id ? 'Cerrar' : 'Ver más'}
                                        </Button>
                                    </td>
                                </tr>
                                
                                {filaAbierta === p.id && (
                                    <tr className="fila-acciones-extra">
                                        <td colSpan="4">
                                            <div className="extra-info-container">
                                                <div className="info-grid">
                                                    <span><strong>DNI:</strong> {p.dni || 'Sin datos'}</span>
                                                    <span><strong>Emergencia:</strong> {p.emergencia || 'Sin datos'}</span>
                                                    
                                                    <span className="becado-status">
                                                        <strong>Condición:</strong> 
                                                        <span className={p.es_becado ? "badge-becado" : "badge-normal"}>
                                                            {p.es_becado ? "Becado (0% Centro)" : "Normal (25% Centro)"}
                                                        </span>
                                                    </span>
                                                </div>
                                                
                                                <div className="extra-buttons">
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => navigate(`/editarpaciente/${p.id}`)}
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        onClick={() => eliminarPaciente(p.id)}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
}