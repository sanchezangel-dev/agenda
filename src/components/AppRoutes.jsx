import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import AtencionForm from '../components/AtencionForm';
import EditarAtencion from '../components/EditarAtencion';
import PacienteForm from '../components/PacienteForm';
import Pacientes from '../pages/Pacientes';
import EditarPaciente from '../components/EditarPaciente';
import Pagos from '../pages/Pagos';


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/registrar" element={<AtencionForm />} />
      <Route path="/editar/:id" element={<EditarAtencion />} />
      <Route path="/nuevo-paciente" element={<PacienteForm />} />
      <Route path='/pacientes' element={<Pacientes />} />
      <Route path="/editarpaciente/:id" element={<EditarPaciente />} />
      <Route path='/pagos' element={<Pagos />} />

    </Routes>
  );
}