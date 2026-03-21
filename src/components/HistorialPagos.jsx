import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient'; 
import '../styles/Historial.css'; 

export default function HistorialPagos() {
    const [pagos, setPagos] = useState([]);

    useEffect(() => {
        fetchPagos();
    }, []);

    const fetchPagos = async () => {
        const { data, error } = await supabase
            .from('pagos')
            .select('*')
            .order('fecha', { ascending: false });

        if (error) {
            console.error("Error al cargar pagos:", error.message);
        } else {
            setPagos(data || []);
        }
    };

    return (
        <div className="historial-container">
            <h3>Historial de Pagos realizados</h3>
            <table className="historial-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Método</th>
                    </tr>
                </thead>
                <tbody>
                    {pagos.map((p) => (
                        <tr key={p.id}>
                            <td>{p.fecha}</td>
                            <td>${p.monto}</td>
                            <td>{p.metodoPago}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}