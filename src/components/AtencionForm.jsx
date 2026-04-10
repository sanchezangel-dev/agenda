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
  
  // Estado para saber si el paciente seleccionado es becado
  const [esBecado, setEsBecado] = useState(false);

  useEffect(() => {
    const fetchPacientes = async () => {
      // Traemos nombre e ID para el select, y es_becado para la lógica
      const { data } = await supabase.from('pacientes').select('id, nombre, es_becado');
      setPacientes(data || []);
    };
    fetchPacientes();
  }, []);

  // Manejamos el cambio de paciente y detectamos la condición de beca
  const handlePacienteChange = (id) => {
    setPacienteId(id);
    const seleccionado = pacientes.find(p => p.id === parseInt(id));
    if (seleccionado) {
      setEsBecado(seleccionado.es_becado);
    } else {
      setEsBecado(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const total = parseFloat(montoTotal) || 0;
    
    // Lógica de porcentajes: 0% si es becado, 25% si es normal
    const montoCentro = esBecado ? 0 : total * 0.25;
    const montoPaciente = esBecado ? total : total * 0.75;

    const { error } = await supabase.from('atenciones').insert([{
      paciente_id: parseInt(pacienteId), 
      fecha: fecha,
      notas: notas,
      montoTotal: total,
      montoPaciente: montoPaciente,
      montoCentro: montoCentro,
      metodoPago: metodoPago,
      es_becado: esBecado // Guardamos el estado en la fila de atención
    }]);
    
    if (error) {
      console.error("Error al guardar:", error);
      alert("Error de Supabase: " + error.message);
    } else {
      alert("¡Atención registrada con éxito!");
      navigate('/'); 
    }
  };

  // Helper para evitar el error de toFixed si el monto está vacío
  const calcularMonto = (valor) => {
    const num = Number(valor) || 0;
    return num.toFixed(2);
  };

  return (
    <form className="atencion-form" onSubmit={handleSubmit}>
      <h3>Registrar Atención</h3>
      
      <select value={pacienteId} onChange={(e) => handlePacienteChange(e.target.value)} required>
        <option value="">Seleccionar Paciente</option>
        {pacientes.map(p => (
          <option key={p.id} value={p.id}>
            {p.nombre} {p.es_becado ? "⭐ (Becado)" : ""}
          </option>
        ))}
      </select>

      <input 
        type="date" 
        value={fecha} 
        onChange={(e) => setFecha(e.target.value)} 
        required 
      />
      
      <input 
        type="number" 
        placeholder="Monto Total ($)" 
        value={montoTotal} 
        onChange={(e) => setMontoTotal(e.target.value)} 
        required 
      />

      <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} required>
        <option value="">Método de pago</option>
        <option value="Efectivo">Efectivo</option>
        <option value="Transferencia">Transferencia</option>
        <option value="Tarjeta">Tarjeta</option>
        <option value="Mercado Pago">Mercado Pago</option>
      </select>
      
      <textarea 
        placeholder="Notas" 
        value={notas} 
        onChange={(e) => setNotas(e.target.value)} 
      />

      {/* Resumen dinámico con protección de errores */}
      <div className={`resumen-calculo ${esBecado ? 'resumen-becado' : ''}`}>
        {esBecado ? (
          <p style={{ color: '#22c55e', fontWeight: 'bold' }}>
            ✨ Paciente Becado: El profesional recibe el 100%
          </p>
        ) : (
          <p>Centro (25%): <strong>${ calcularMonto(Number(montoTotal) * 0.25) }</strong></p>
        )}
        
        <p>
          Tus Honorarios: 
          <strong>
            ${ esBecado ? calcularMonto(montoTotal) : calcularMonto(Number(montoTotal) * 0.75) }
          </strong>
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="submit" style={{ flex: 2 }}>Guardar Registro</button>
        <button 
          type="button" 
          onClick={() => navigate('/')} 
          style={{ 
            flex: 1, 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}