import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient.js'; // Asegurate de que la ruta a tu cliente de Supabase sea la correcta
import '../styles/ResumenFinanciero.css';
import Button from '../components/Button';

const ResumenFinanciero = () => {
    const [atenciones, setAtenciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mesesExpandidos, setMesesExpandidos] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAtenciones = async () => {
            try {
                const { data, error } = await supabase
                    .from('atenciones')
                    .select(`
                        id,
                        fecha,
                        montoTotal,
                        montoCentro,
                        montoPaciente,
                        comision_porcentaje,
                        pacientes (
                            nombre
                        )
                    `)
                    .order('fecha', { ascending: false });

                if (error) throw error;
                setAtenciones(data || []);
            } catch (error) {
                console.error("Error al cargar el resumen financiero:", error.message);
            } finally {
                setCargando(false);
            }
        };

        fetchAtenciones();
    }, []);

    // Lógica para agrupar montos por mes
    const resumenMensual = useMemo(() => {
        const agrupado = {};
        atenciones.forEach(atencion => {
            if (!atencion.fecha) return;

            const [anio, mes] = atencion.fecha.split('-');
            const claveMes = `${anio}-${mes}`;

            if (!agrupado[claveMes]) {
                agrupado[claveMes] = {
                    clave: claveMes,
                    anio: parseInt(anio),
                    mesNum: parseInt(mes),
                    totalBruto: 0,
                    totalProfesional: 0,
                    totalCentro: 0,
                    totalSesiones: 0,
                    pacientes: {}
                };
            }

            const total = parseFloat(atencion.montoTotal) || 0;
            const profesional = parseFloat(atencion.montoPaciente) || 0;
            const centro = parseFloat(atencion.montoCentro) || 0;
            const nombrePaciente = atencion.pacientes?.nombre || 'Paciente no especificado';

            agrupado[claveMes].totalBruto += total;
            agrupado[claveMes].totalProfesional += profesional;
            agrupado[claveMes].totalCentro += centro;
            agrupado[claveMes].totalSesiones += 1;

            if (!agrupado[claveMes].pacientes[nombrePaciente]) {
                agrupado[claveMes].pacientes[nombrePaciente] = {
                    nombre: nombrePaciente,
                    sesiones: 0,
                    totalRecaudado: 0,
                    totalProfesional: 0,
                    totalCentro: 0
                };
            }

            agrupado[claveMes].pacientes[nombrePaciente].sesiones += 1;
            agrupado[claveMes].pacientes[nombrePaciente].totalRecaudado += total;
            agrupado[claveMes].pacientes[nombrePaciente].totalProfesional += profesional;
            agrupado[claveMes].pacientes[nombrePaciente].totalCentro += centro;
        });

        return Object.values(agrupado).sort((a, b) => b.clave.localeCompare(a.clave));
    }, [atenciones]);

    const toggleMes = (clave) => {
        setMesesExpandidos(prev => ({ ...prev, [clave]: !prev[clave] }));
    };

    const obtenerNombreMes = (numMes) => {
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        return meses[numMes - 1];
    };

    const esMesActual = (claveMes) => {
        const fecha = new Date();
        const claveActual = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        return claveMes === claveActual;
    };

    if (cargando) {
        return <div className="cargando-financiero">Cargando resumen financiero...</div>;
    }

    return (
        <div className="resumen-financiero-container">
            {/* Barra superior con botón volver e info alineada */}
            <div className="financiero-top-bar">
                <header className="financiero-header">
                    <h2>Resumen Financiero Histórico</h2>
                    <p>Historial consolidado de facturación, honorarios y aportes de Centro Raíces.</p>
                </header>
                <Button variant="ghost" size="small" onClick={() => navigate(-1)}>
                    ← Volver
                </Button>
            </div>

            {/* Tabla Principal desplazada hacia abajo */}
            <div className="tabla-financiera-wrapper">
                <table className="tabla-financiera">
                    <thead>
                        <tr>
                            <th>Período</th>
                            <th>Estado</th>
                            <th>Sesiones</th>
                            <th>Total Bruto</th>
                            <th>Tus Honorarios</th>
                            <th>Total Centro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resumenMensual.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="tabla-vacia">No hay registros de atenciones para generar el resumen financiero.</td>
                            </tr>
                        ) : (
                            resumenMensual.map((mes) => {
                                const expandido = mesesExpandidos[mes.clave];
                                const esActual = esMesActual(mes.clave);

                                return (
                                    <React.Fragment key={mes.clave}>
                                        <tr className={`fila-mes-principal ${esActual ? 'mes-en-curso' : ''}`}>
                                            <td data-label="Período" className="col-periodo">
                                                <strong>{obtenerNombreMes(mes.mesNum)} {mes.anio}</strong>
                                            </td>
                                            <td data-label="Estado">
                                                <span className={`badge-estado ${esActual ? 'estado-curso' : 'estado-pendiente'}`}>
                                                    {esActual ? 'En curso' : 'Liquidado'}
                                                </span>
                                            </td>
                                            <td data-label="Sesiones">{mes.totalSesiones} asists.</td>
                                            <td data-label="Total Bruto" className="monto-bruto">${mes.totalBruto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                            <td data-label="Tus Honorarios" className="monto-profesional">${mes.totalProfesional.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                            <td data-label="Total Centro" className="monto-centro">${mes.totalCentro.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                            <td data-label="Acciones">
                                                <Button
                                                    variant={expandido ? 'primary' : 'secondary'}
                                                    size="small"
                                                    onClick={() => toggleMes(mes.clave)}
                                                >
                                                    {expandido ? 'Ocultar' : 'Detalles'}
                                                </Button>
                                            </td>
                                        </tr>

                                        {/* Detalle interno desplegable */}
                                        {expandido && (
                                            <tr className="fila-desplegable-detalle">
                                                <td colSpan="7">
                                                    <div className="contenedor-desglose-pacientes">
                                                        <h4>📋 Auditoría de Pacientes de {obtenerNombreMes(mes.mesNum)}</h4>
                                                        <table className="tabla-desglose-interna">
                                                            <thead>
                                                                <tr>
                                                                    <th>Paciente</th>
                                                                    <th>Sesiones</th>
                                                                    <th>Total Abonado</th>
                                                                    <th>Tus Honorarios</th>
                                                                    <th>Aporte Centro</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {Object.values(mes.pacientes).map((p, idx) => (
                                                                    <tr key={idx}>
                                                                        <td data-label="Paciente"><strong>{p.nombre}</strong></td>
                                                                        <td data-label="Sesiones">{p.sesiones}</td>
                                                                        <td data-label="Total Abonado">${p.totalRecaudado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                                        <td data-label="Tus Honorarios" className="txt-verde">${p.totalProfesional.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                                        <td data-label="Aporte Centro" className="txt-rosa">${p.totalCentro.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResumenFinanciero;