// src/components/BadgePaciente.jsx
import React from 'react';

export default function BadgePaciente({ paciente }) {
  if (!paciente) return null;

  // Función para decidir qué clase de CSS usar
  const getBadgeClass = (etiqueta) => {
    if (etiqueta === "CONVENIO") return "badge-convenio";
    if (etiqueta === "REINTEGRO") return "badge-reintegro";
    return "badge-etiqueta-admin"; // Clase genérica por las dudas
  };

  return (
    <div style={{ display: 'inline-flex', gap: '5px', marginLeft: '10px', verticalAlign: 'middle' }}>
      {/* Beca (Siempre verde) */}
      {paciente.es_becado && (
        <span className="badge-beca-tabla">Becado</span>
      )}

      {/* Etiquetas Administrativas con colores distintos */}
      {paciente.etiqueta && (
        <span className={getBadgeClass(paciente.etiqueta)}>
          {paciente.etiqueta}
        </span>
      )}
    </div>
  );
}