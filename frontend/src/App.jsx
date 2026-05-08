import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Choferes from './components/Choferes';
import Vehiculos from './components/Vehiculos';
import Rutas from './components/Rutas';
import Planificacion from './components/Planificacion';
import Configuracion from './components/Configuracion';
import VistaChofer from './components/VistaChofer';
import Toasts from './components/Toasts';

function App() {
  return (
    <Router>
      <Toasts />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/choferes" element={<Choferes />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/rutas" element={<Rutas />} />
        <Route path="/planificacion" element={<Planificacion />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/vistachofer" element={<VistaChofer />} />
      </Routes>
    </Router>
  );
}

export default App;