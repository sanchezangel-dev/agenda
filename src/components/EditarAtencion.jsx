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
    es_becado: false,
    comision_porcentaje: 25 // Nuevo campo
  });
  
  const [loading, setLoading] = useState(true);
  const [porcentajeHabilitado, setPorcentajeHabilitado] = useState(false);

  // Recalcula porcentajes cuando montoTotal, es_becado o comision_porcentaje cambian
  useEffect(() => {
    const total = parseFloat(formData.montoTotal) || 0;
    const porc = parseFloat(formData.comision_porcentaje) || 0;
    
    // Si es becado, el centro es 0. Si no, usa el porcentaje del estado.
    const centro = formData.es_becado ? 0 : (total * (porc / 100));
    const profesional = total - centro;

    setFormData(prev => ({
      ...prev,
      montoCentro: centro.toFixed(2),
      montoPaciente: profesional.toFixed(2)
    }));
  }, [formData.montoTotal, formData.es_becado, formData.comision_porcentaje]);

  useEffect(() => {
    const cargarDatos = async () => {
      const { data, error } = await supabase
        .from('atenciones')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        // Aseguramos que si comision_porcentaje es null, use 25 por defecto
        setFormData({
          ...data,
          comision_porcentaje: data.comision_porcentaje ?? 25
        });
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
        es_becado: formData.es_becado,
        comision_porcentaje: parseFloat(formData.comision_porcentaje)
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

      {/* Checkbox para becado */}
      <div style={{ margin: '15px 0', padding: '10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#276749', fontWeight: 'bold' }}>
              <input 
                  type="checkbox" 
                  checked={formData.es_becado} 
                  onChange={(e) => {
                      const becado = e.target.checked;
                      setFormData({
                          ...formData, 
                          es_becado: becado,
                          comision_porcentaje: becado ? 0 : 25 // Ajuste automático
                      });
                  }} 
              />
              ¿Paciente Becado? (Centro cobra $0)
          </label>
      </div>

      {/* Nuevo Campo: Porcentaje de Comisión */}
      <div className="campo-porcentaje" style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '5px' }}>
          % Comisión Centro:
        </label>
        <input 
          type="number"
          value={formData.comision_porcentaje}
          onChange={(e) => setFormData({...formData, comision_porcentaje: e.target.value})}
          readOnly={!porcentajeHabilitado}
          onFocus={() => setPorcentajeHabilitado(true)}
          onClick={() => setPorcentajeHabilitado(true)}
          style={{ 
            width: '100%', 
            padding: '8px', 
            backgroundColor: porcentajeHabilitado ? '#fff' : '#f0f0f0',
            cursor: porcentajeHabilitado ? 'text' : 'pointer',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        {!porcentajeHabilitado && !formData.es_becado && (
          <small style={{ fontSize: '0.7rem', color: '#007bff', cursor: 'pointer' }} onClick={() => setPorcentajeHabilitado(true)}>
             ℹ️ Clic para editar %
          </small>
        )}
      </div>

      <label>Centro:</label>
      <input type="number" value={formData.montoCentro} disabled />

      <label>Tus Honorarios:</label>
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

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="submit" style={{ flex: 1 }}>Guardar Cambios</button>
        <button type="button" onClick={() => navigate('/')} style={{ flex: 1, background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
            Cancelar
        </button>
      </div>
    </form>
  );
}