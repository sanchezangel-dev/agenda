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
    montoCentro: 0
  });
  const [loading, setLoading] = useState(true);

  // Recalcula porcentajes cuando montoTotal cambia
  useEffect(() => {
    const total = parseFloat(formData.montoTotal) || 0;
    setFormData(prev => ({
      ...prev,
      montoCentro: (total * 0.25).toFixed(2),
      montoPaciente: (total * 0.75).toFixed(2)
    }));
  }, [formData.montoTotal]);

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
        metodoPago: formData.metodoPago
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
      <h3>Editar Atención {/*#{id}*/} </h3>
      
      <label>Fecha:</label>
      <input type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} />

      <label>Monto Total:</label>
      <input type="number" value={formData.montoTotal} onChange={(e) => setFormData({...formData, montoTotal: e.target.value})} />

      <label>Centro (25%):</label>
      <input type="number" value={formData.montoCentro} disabled />

      <label>Paciente (75%):</label>
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

      <button type="submit">Guardar Cambios</button>
      <button type="button" onClick={() => navigate('/')}>Cancelar</button>
    </form>
  );
}