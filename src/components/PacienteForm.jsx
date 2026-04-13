import React, { useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../styles/PacienteForm.css'; 
import Button from '../components/Button';

export default function PacienteForm() {
  const [formData, setFormData] = useState({
    nombre: '', 
    dni: '', 
    nacimiento: '', 
    celular: '', 
    emergencia: '',
    es_becado: false,
    etiqueta: '' // Nuevo campo para la base de datos
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Enviamos el objeto completo, Supabase se encarga del resto
    const { error } = await supabase.from('pacientes').insert([formData]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("✅ Paciente guardado con éxito");
      navigate('/Pacientes');
    }
  };

  return (
    <div className="form-container">
      <h2>Nuevo Paciente</h2>
      <form onSubmit={handleSubmit} className="paciente-form">
        <input 
          type="text" 
          placeholder="Nombre completo" 
          required 
          value={formData.nombre}
          onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
        />
        <input 
          type="text" 
          placeholder="DNI" 
          value={formData.dni}
          onChange={(e) => setFormData({...formData, dni: e.target.value})} 
        />
        <input 
          type="date" 
          placeholder="Fecha de Nacimiento" 
          value={formData.nacimiento}
          onChange={(e) => setFormData({...formData, nacimiento: e.target.value})} 
        />
        <input 
          type="tel" 
          placeholder="Celular" 
          value={formData.celular}
          onChange={(e) => setFormData({...formData, celular: e.target.value})} 
        />
        <input 
          type="text" 
          placeholder="Contacto Emergencia" 
          value={formData.emergencia}
          onChange={(e) => setFormData({...formData, emergencia: e.target.value})} 
        />
        
        {/* --- NUEVO SELECT DE CONDICIÓN --- */}
        <div className="select-group-admin" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
            Condición Administrativa:
          </label>
          <select 
            className="form-control"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            value={formData.etiqueta}
            onChange={(e) => setFormData({...formData, etiqueta: e.target.value})}
          >
            <option value="">Ninguna</option>
            <option value="CONVENIO">Convenio</option>
            <option value="REINTEGRO">Reintegro</option>
          </select>
        </div>
        
        {/* Checkbox de Becado */}
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={formData.es_becado} 
              onChange={(e) => setFormData({...formData, es_becado: e.target.checked})} 
            />
            <span className="checkbox-text">Paciente Becado (0% al Centro)</span>
          </label>
        </div>
        
        <div className="button-group">
          <Button type="submit" variant="primary">Guardar Paciente</Button>
          <button type="button" className="btn-cancel" onClick={() => navigate('/Pacientes')}>Volver</button>
        </div>
      </form>
    </div>
  );
}