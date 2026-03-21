// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; // Importamos el Router
import { supabase } from './api/supabaseClient';
import Login from './pages/Login';
import AppRoutes from './components/AppRoutes'; // Importamos nuestras nuevas rutas
import './index.css';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app-container">
        {/* Si no hay sesión, Login. Si hay sesión, mostramos las rutas */}
        {!session ? <Login /> : <AppRoutes />}
      </div>
    </Router>
  );
}

export default App;