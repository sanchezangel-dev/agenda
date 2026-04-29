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
  
  // NUEVOS ESTADOS: porcentaje y si está bloqueado
  const [porcentaje, setPorcentaje] = useState(25);
  const [porcentajeHabilitado, setPorcentajeHabilitado] = useState(false);
  const [esBecado, setEsBecado] = useState(false);

  useEffect(() => {
    const fetchPacientes = async () => {
      const { data } = await supabase.from('pacientes').select('id, nombre, es_becado');
      setPacientes(data || []);
    };
    fetchPacientes();
  }, []);

  const handlePacienteChange = (id) => {
    setPacienteId(id);
    const seleccionado = pacientes.find(p => p.id === parseInt(id));
    if (seleccionado) {
      setEsBecado(seleccionado.es_becado);
      // Si es becado, forzamos el porcentaje a 0, sino volvemos al 25
      setPorcentaje(seleccionado.es_becado ? 0 : 25);
    } else {
      setEsBecado(false);
      setPorcentaje(25);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const total = parseFloat(montoTotal) || 0;
    const porc = parseFloat(porcentaje) || 0;
    
    // CÁLCULOS DINÁMICOS basados en el input de porcentaje
    const montoCentro = total * (porc / 100);
    const montoPaciente = total - montoCentro;

    const { error } = await supabase.from('atenciones').insert([{
      paciente_id: parseInt(pacienteId), 
      fecha: fecha,
      notas: notas,
      montoTotal: total,
      montoPaciente: montoPaciente,
      montoCentro: montoCentro,
      metodoPago: metodoPago,
      es_becado: esBecado,
      comision_porcentaje: porc // Guardamos el nuevo campo
    }]);
    
    if (error) {
      console.error("Error al guardar:", error);
      alert("Error de Supabase: " + error.message);
    } else {
      alert("¡Atención registrada con éxito!");
      navigate('/'); 
    }
  };

  const calcularMonto = (valor) => {
    const num = Number(valor) || 0;
    return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

      {/* INPUT DE PORCENTAJE: Se habilita al hacer click */}
<div className="campo-porcentaje" style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>
          % Comisión Centro:
        </label>
        <input 
          type="number"
          value={porcentaje}
          onChange={(e) => setPorcentaje(e.target.value)}
          // Cambiamos disabled por readOnly para que detecte el click
          readOnly={!porcentajeHabilitado}
          onFocus={() => setPorcentajeHabilitado(true)}
          onClick={() => setPorcentajeHabilitado(true)}
          style={{ 
            width: '100%', 
            padding: '8px', 
            backgroundColor: porcentajeHabilitado ? '#fff' : '#f8f9fa',
            cursor: porcentajeHabilitado ? 'text' : 'pointer',
            border: porcentajeHabilitado ? '1px solid #007bff' : '1px solid #ccc',
            borderRadius: '4px',
            outline: 'none'
          }}
          title="Click para modificar el porcentaje"
        />
        {!porcentajeHabilitado && (
          <small style={{ fontSize: '0.7rem', color: '#007bff', cursor: 'pointer' }} onClick={() => setPorcentajeHabilitado(true)}>
            ℹ️ Clic para editar porcentaje
          </small>
        )}
      </div>
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

      {/* Resumen dinámico actualizado con el nuevo porcentaje */}
      <div className={`resumen-calculo ${esBecado ? 'resumen-becado' : ''}`}>
        <p>
          Centro ({porcentaje}%): 
          <strong> ${ calcularMonto(Number(montoTotal) * (Number(porcentaje) / 100)) }</strong>
        </p>
        
        <p>
          Tus Honorarios: 
          <strong>
            ${ calcularMonto(Number(montoTotal) - (Number(montoTotal) * (Number(porcentaje) / 100))) }
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