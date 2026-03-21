import React, { useState } from 'react';
import { supabase } from '../api/supabaseClient.js';
import '../styles/Login.css';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Acceso Profesional</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}