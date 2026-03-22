import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient.js';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';
import HistorialAtenciones from '../components/HistorialAtenciones.jsx';
import Button from '../components/Button.jsx';

export default function Dashboard() {
    const navigate = useNavigate();
    const [totales, setTotales] = useState({ profesional: 0, centro: 0 });

    const fetchResumenMensual = async () => {
        const ahora = new Date();
        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');

        const inicioMes = `${anio}-${mes}-01`;
        const finMes = `${anio}-${mes}-31`;

        try {
            // Usamos los nombres reales de tu tabla: montoPaciente y montoCentro
            const { data, error } = await supabase
                .from('atenciones')
                .select('montoPaciente, montoCentro')
                .gte('fecha', inicioMes)
                .lte('fecha', finMes);

            if (error) throw error;

            if (data) {
                // Sumamos usando los nombres de columna correctos
                const totalProfesional = data.reduce((acc, curr) => acc + (curr.montoPaciente || 0), 0);
                const totalCentro = data.reduce((acc, curr) => acc + (curr.montoCentro || 0), 0);

                setTotales({ profesional: totalProfesional, centro: totalCentro });
            }
        } catch (err) {
            console.error("Error al obtener el resumen mensual:", err.message);
        }
    };

    useEffect(() => {
        fetchResumenMensual();
    }, []);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>¡Hola, Natalia! 🌿</h1>
                <button onClick={() => supabase.auth.signOut()}>Cerrar Sesión</button>
            </header>

            <main className="dashboard-content">
                <h2>Tu Agenda Profesional</h2>

                <div className="actions-bar" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>

                    <Button
                        variant="secondary"
                        onClick={() => navigate('/registrar')}
                    >
                        + Nueva Atención
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => navigate('/Pacientes')}
                    >
                        Pacientes
                    </Button>

                    <Button
                        variant="payment"
                        onClick={() => navigate('/Pagos')}
                    >
                        Pagos
                    </Button>

                </div>

                <div className="resumen-financiero-container">
                    <h3>Saldo a pagar al Centro: ${totales.centro}</h3>

                </div>

                <HistorialAtenciones />
            </main>
        </div>
    );
}
