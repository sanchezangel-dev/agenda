import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient.js';
import { useNavigate } from 'react-router-dom';
import '../styles/Pacientes.css';
import Button from '../components/Button.jsx';

export default function Pacientes() {
    const [listaPacientes, setListaPacientes] = useState([]);
    const [filaAbierta, setFilaAbierta] = useState(null); // Para controlar el "Ver más"
    const navigate = useNavigate();

    // Función para calcular edad basada en el campo 'nacimiento'
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
                <h1>Pacientes 👥</h1>
                <button onClick={() => navigate('/')} className="btn-secondary">Volver</button>
            </header>

            <main className="dashboard-content">

                <Button
                    variant="primary"
                    onClick={() => navigate(`/nuevo-paciente`)} style={{ marginBottom: '20px' }}
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
                                <tr>
                                    <td>{p.nombre}</td>
                                    <td>{calcularEdad(p.nacimiento)} años</td>
                                    <td>{p.celular}</td>
                                    <td>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => setFilaAbierta(filaAbierta === p.id ? null : p.id)}
                                                >
                                                    {filaAbierta === p.id ? 'Cerrar' : 'Ver más'}
                                                </Button>

                                    </td>
                                </tr>
                                {/* Fila extra que aparece al cliquear "Ver más" */}
                                {filaAbierta === p.id && (
                                    <tr className="fila-acciones-extra">
                                        <td colSpan="4">
                                            <div style={{ display: 'flex', gap: '20px', padding: '10px', backgroundColor: '#f9f9f9', justifyContent: 'center' }}>
                                                <span><strong>DNI:</strong> {p.dni}</span>
                                                <span><strong>Emergencia:</strong> {p.emergencia}</span>

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