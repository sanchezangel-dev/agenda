import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import Button from '../components/Button';
import '../styles/EditarPaciente.css'; 

export default function EditarPaciente() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [paciente, setPaciente] = useState({
        nombre: '',
        dni: '',
        nacimiento: '',
        celular: '',
        emergencia: '',
        es_becado: false,
        etiqueta: '' // Nuevo campo para Convenio/Reintegro
    });

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

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        
        setPaciente({
            ...paciente,
            [e.target.name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('pacientes')
            .update({
                nombre: paciente.nombre,
                dni: paciente.dni,
                nacimiento: paciente.nacimiento,
                celular: paciente.celular,
                emergencia: paciente.emergencia,
                es_becado: paciente.es_becado,
                etiqueta: paciente.etiqueta // Guardamos la etiqueta en Supabase
            })
            .eq('id', id);

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            alert("✅ Paciente actualizado con éxito");
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

                {/* --- SECCIÓN DE CONDICIONES --- */}
                <div className="admin-section">
                    <div className="input-group">
                        <label>Condición Administrativa</label>
                        <select 
                            name="etiqueta" 
                            value={paciente.etiqueta || ""} 
                            onChange={handleChange}
                            className="form-select-admin"
                        >
                            <option value="">Ninguna</option>
                            <option value="CONVENIO">Convenio</option>
                            <option value="REINTEGRO">Reintegro</option>
                        </select>
                    </div>

                    <div className="input-group checkbox-container-edit">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox" 
                                name="es_becado"
                                checked={paciente.es_becado} 
                                onChange={handleChange} 
                            />
                            <span>Paciente Becado (0% al Centro)</span>
                        </label>
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