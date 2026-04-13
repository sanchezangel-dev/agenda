import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient.js';
import { useNavigate } from 'react-router-dom';
import '../styles/Pacientes.css';
import Button from '../components/Button.jsx';
// 1. Importamos el componente de los badges
import BadgePaciente from '../components/BadgePaciente.jsx';

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
                                <tr className={p.es_becado ? "fila-becada" : ""}>
                                    <td data-label="Nombre">
                                        {p.nombre}
                                        {/* 2. Reemplazamos la lógica vieja por el componente */}
                                        <BadgePaciente paciente={p} />
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
                                                    
                                                    {/* También lo podemos usar aquí adentro si quisieras, 
                                                        pero con verlo en la tabla principal ya suele alcanzar */}
                                                    <span className="becado-status">
                                                        <strong>Condición:</strong> 
                                                        <BadgePaciente paciente={p} />
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