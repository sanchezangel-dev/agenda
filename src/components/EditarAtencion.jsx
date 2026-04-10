import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';

export default function EditarAtencion() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    montoTotal: 0,
    notas: '',
    fecha: '',
    metodoPago: '',
    montoPaciente: 0,
    montoCentro: 0,
    es_becado: false // Agregamos este campo
  });
  const [loading, setLoading] = useState(true);

  // Recalcula porcentajes cuando montoTotal cambia, PERO chequeando si es becado
  useEffect(() => {
    const total = parseFloat(formData.montoTotal) || 0;
    
    // Si es becado, el centro es 0 y el profesional se lleva el 100%
    const centro = formData.es_becado ? 0 : (total * 0.25);
    const profesional = formData.es_becado ? total : (total * 0.75);

    setFormData(prev => ({
      ...prev,
      montoCentro: centro.toFixed(2),
      montoPaciente: profesional.toFixed(2)
    }));
  }, [formData.montoTotal, formData.es_becado]); // Ahora también depende de es_becado

  useEffect(() => {
    const cargarDatos = async () => {
      const { data, error } = await supabase
        .from('atenciones')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setFormData(data);
        setLoading(false);
      }
    };
    cargarDatos();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('atenciones')
      .update({ 
        montoTotal: parseFloat(formData.montoTotal),
        montoPaciente: parseFloat(formData.montoPaciente),
        montoCentro: parseFloat(formData.montoCentro),
        notas: formData.notas,
        fecha: formData.fecha,
        metodoPago: formData.metodoPago,
        es_becado: formData.es_becado // Guardamos el estado
      })
      .eq('id', id);

    if (!error) {
      alert("Registro actualizado con éxito");
      navigate('/');
    } else {
      alert("Error: " + error.message);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <form onSubmit={handleUpdate} className="atencion-form">
      <h3>Editar Atención</h3>
      
      <label>Fecha:</label>
      <input type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} />

      <label>Monto Total:</label>
      <input type="number" value={formData.montoTotal} onChange={(e) => setFormData({...formData, montoTotal: e.target.value})} />

      {/* Checkbox para corregir si es becado o no */}
      <div style={{ margin: '15px 0', padding: '10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#276749', fontWeight: 'bold' }}>
              <input 
                  type="checkbox" 
                  checked={formData.es_becado} 
                  onChange={(e) => setFormData({...formData, es_becado: e.target.checked})} 
              />
              ¿Paciente Becado? (Centro cobra $0)
          </label>
      </div>

      <label>Centro ({formData.es_becado ? '0%' : '25%'}):</label>
      <input type="number" value={formData.montoCentro} disabled />

      <label>Tus Honorarios ({formData.es_becado ? '100%' : '75%'}):</label>
      <input type="number" value={formData.montoPaciente} disabled />

      <label>Método de Pago:</label>
      <select value={formData.metodoPago} onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}>
        <option value="Efectivo">Efectivo</option>
        <option value="Transferencia">Transferencia</option>
        <option value="Tarjeta">Tarjeta</option>
        <option value="Mercado Pago">Mercado Pago</option>
      </select>

      <label>Notas:</label>
      <textarea value={formData.notas} onChange={(e) => setFormData({...formData, notas: e.target.value})} />

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" style={{ flex: 1 }}>Guardar Cambios</button>
        <button type="button" onClick={() => navigate('/')} style={{ flex: 1, background: '#6c757d' }}>Cancelar</button>
      </div>
    </form>
  );
}