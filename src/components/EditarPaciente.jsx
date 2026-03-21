import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import Button from '../components/Button';
import '../styles/EditarPaciente.css'; 

export default function EditarPaciente() {
    const { id } = useParams(); // Agarramos el ID de la URL
    const navigate = useNavigate();
    
    const [paciente, setPaciente] = useState({
        nombre: '',
        dni: '',
        nacimiento: '',
        celular: '',
        emergencia: ''
    });

    // 1. Cargar los datos actuales del paciente al montar el componente
    useEffect(() => {
        const fetchPaciente = async () => {
            const { data, error } = await supabase
                .from('pacientes')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error cargando paciente:", error);
                alert("No se pudo encontrar el paciente.");
                navigate('/Pacientes');
            } else {
                setPaciente(data);
            }
        };

        fetchPaciente();
    }, [id, navigate]);

    // 2. Manejar los cambios en los inputs
    const handleChange = (e) => {
        setPaciente({
            ...paciente,
            [e.target.name]: e.target.value
        });
    };

    // 3. Guardar los cambios en Supabase
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('pacientes')
            .update({
                nombre: paciente.nombre,
                dni: paciente.dni,
                nacimiento: paciente.nacimiento,
                celular: paciente.celular,
                emergencia: paciente.emergencia
            })
            .eq('id', id);

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            alert("Paciente actualizado con éxito");
            navigate('/Pacientes');
        }
    };

    return (
        <div className="form-container">
            <header className="form-header">
                <h2>Editar Paciente ✏️</h2>
            </header>

            <form onSubmit={handleSubmit} className="form-card">
                <div className="input-group">
                    <label>Nombre Completo</label>
                    <input 
                        type="text" 
                        name="nombre" 
                        value={paciente.nombre} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="input-group">
                    <label>DNI</label>
                    <input 
                        type="text" 
                        name="dni" 
                        value={paciente.dni} 
                        onChange={handleChange} 
                    />
                </div>

                <div className="input-group">
                    <label>Fecha de Nacimiento</label>
                    <input 
                        type="date" 
                        name="nacimiento" 
                        value={paciente.nacimiento || ''} 
                        onChange={handleChange} 
                    />
                </div>

                <div className="input-row">
                    <div className="input-group">
                        <label>Celular</label>
                        <input 
                            type="text" 
                            name="celular" 
                            value={paciente.celular} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="input-group">
                        <label>Contacto de Emergencia</label>
                        <input 
                            type="text" 
                            name="emergencia" 
                            value={paciente.emergencia} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <Button type="submit" variant="primary">
                        Guardar Cambios
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/Pacientes')}>
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
}