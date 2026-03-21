import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import '../styles/AtencionForm.css';
import { useNavigate } from 'react-router-dom';

export default function AtencionForm() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [pacienteId, setPacienteId] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [notas, setNotas] = useState('');
  const [metodoPago, setMetodoPago] = useState('');

  useEffect(() => {
    const fetchPacientes = async () => {
      const { data } = await supabase.from('pacientes').select('id, nombre');
      setPacientes(data || []);
    };
    fetchPacientes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const total = parseFloat(montoTotal) || 0;
    const montoCentro = total * 0.25;
    const montoPaciente = total * 0.75;

    const { error } = await supabase.from('atenciones').insert([{
      paciente_id: parseInt(pacienteId), 
      fecha: fecha,
      notas: notas,
      montoTotal: total,
      montoPaciente: montoPaciente,
      montoCentro: montoCentro,
      metodoPago: metodoPago
    }]);
    
    if (error) {
      console.error("Error al guardar:", error);
      alert("Error de Supabase: " + error.message);
    } else {
      alert("¡Atención registrada con éxito!");
      setPacienteId('');
      setMontoTotal('');
      setNotas('');
      setMetodoPago('');
      navigate('/'); 
    }
  };

  return (
    <form className="atencion-form" onSubmit={handleSubmit}>
      <h3>Registrar Atención</h3>
      
      <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} required>
        <option value="">Seleccionar Paciente</option>
        {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
      </select>

      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      
      <input type="number" placeholder="Monto Total ($)" value={montoTotal} onChange={(e) => setMontoTotal(e.target.value)} required />

      <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} required>
        <option value="">Método de pago</option>
        <option value="Efectivo">Efectivo</option>
        <option value="Transferencia">Transferencia</option>
        <option value="Tarjeta">Tarjeta</option>
        <option value="Mercado Pago">Mercado Pago</option>
      </select>
      
      <textarea placeholder="Notas" value={notas} onChange={(e) => setNotas(e.target.value)} />

      <div className="resumen-calculo">
        <p>Centro (25%): <strong>${ (montoTotal * 0.25 || 0).toFixed(2) }</strong></p>
        <p>Tus Honorarios (75%): <strong>${ (montoTotal * 0.75 || 0).toFixed(2) }</strong></p>
      </div>

      {/* Contenedor de botones */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="submit" style={{ flex: 2 }}>Guardar Registro</button>
        <button 
          type="button" 
          onClick={() => navigate('/')} 
          style={{ flex: 1, backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}