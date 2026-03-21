import React from 'react';
import '../styles/Button.css';

/**
 * @param {string} variant - 'primary' (Verde), 'secondary' (Rosa), 'danger' (Rojo/Eliminar), 'ghost' (Cancelar/Gris)
 * @param {string} size - 'small', 'medium', 'large'
 */
const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  className = '' 
}) => {
  return (
    <button
      type={type}
      className={`btn-custom ${variant} ${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;