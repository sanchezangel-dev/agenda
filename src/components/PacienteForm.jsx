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
    es_becado: false // Estado inicial en false
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
        />
        <input 
          type="text" 
          placeholder="DNI" 
          onChange={(e) => setFormData({...formData, dni: e.target.value})} 
        />
        <input 
          type="date" 
          placeholder="Fecha de Nacimiento" 
          onChange={(e) => setFormData({...formData, nacimiento: e.target.value})} 
        />
        <input 
          type="tel" 
          placeholder="Celular" 
          onChange={(e) => setFormData({...formData, celular: e.target.value})} 
        />
        <input 
          type="text" 
          placeholder="Contacto Emergencia" 
          onChange={(e) => setFormData({...formData, emergencia: e.target.value})} 
        />
        
        {/* Nuevo campo: Checkbox de Becado */}
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