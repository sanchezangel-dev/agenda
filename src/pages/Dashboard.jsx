import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient.js';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';
import HistorialAtenciones from '../components/HistorialAtenciones.jsx';
import Button from '../components/Button.jsx';

export default function Dashboard() {
    const navigate = useNavigate();
    const [totales, setTotales] = useState({ profesional: 0, centro: 0 });

    // Función para obtener el nombre del mes actual
    const obtenerMesActual = () => {
        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        return meses[new Date().getMonth()];
    };

    const fetchResumenMensual = async () => {
        const ahora = new Date();
        const anio = ahora.getFullYear();
        const mes = ahora.getMonth(); // 0 para Enero, 3 para Abril

        // Lógica robusta de fechas:
        // Inicio: Día 1 de este mes a las 00:00:00
        const inicioMes = new Date(anio, mes, 1).toISOString();
        // Fin: Día 1 del mes SIGUIENTE a las 00:00:00
        const finMes = new Date(anio, mes + 1, 1).toISOString();

        try {
            const { data, error } = await supabase
                .from('atenciones')
                .select('montoPaciente, montoCentro')
                .gte('fecha', inicioMes)
                .lt('fecha', finMes); // .lt es "menor que", así no entra el día 1 del mes que viene

            if (error) throw error;

            if (data) {
                // Aseguramos que sume como números (Number) para evitar errores de la DB
                const totalProfesional = data.reduce((acc, curr) => acc + (Number(curr.montoPaciente) || 0), 0);
                const totalCentro = data.reduce((acc, curr) => acc + (Number(curr.montoCentro) || 0), 0);
                
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
                <div className="resumen-financiero-container">
                    <div className="stat-card ganancia">
                        <p>Tus Honorarios ({obtenerMesActual()})</p>
                        <span>${totales.profesional.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="stat-card deuda">
                        <p>Saldo a pagar al Centro ({obtenerMesActual()})</p>
                        <span>${totales.centro.toLocaleString('es-AR')}</span>
                    </div>
                </div>

                <div className="actions-bar">
                    <Button variant="secondary" onClick={() => navigate('/registrar')}>
                        + Nueva Atención
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/Pacientes')}>
                        Pacientes
                    </Button>
                    <Button variant="payment" onClick={() => navigate('/Pagos')}>
                        Pagos
                    </Button>
                </div>

                <HistorialAtenciones />
            </main>
        </div>
    );
}