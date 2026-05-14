import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import Sidebar from './Sidebar.jsx';
import MapaRutas from './MapaRutas.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
  const { sidebarVisible, toggleSidebar, sindicatoName, choferId, logout } = useUI();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [choferes, setChoferes] = useState([]);
  const [activeRoutes, setActiveRoutes] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const [choferRes, rutasRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/choferes/'),
          fetch('http://127.0.0.1:8000/api/rutas-catalogo/'),
        ]);

        if (!choferRes.ok || !rutasRes.ok) {
          throw new Error('No se pudo cargar información del dashboard');
        }

        const choferData = await choferRes.json();
        const rutasData = await rutasRes.json();

        setChoferes(choferData);

        const rutasActivasHoy = rutasData.filter((ruta) => ruta.activa).slice(0, 6);
        setActiveRoutes(rutasActivasHoy);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos del panel.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chofer_id: choferId }),
      });
    } catch (err) {
      console.error('Error en logout:', err);
    }
    logout();
    navigate('/');
  };

  const activeDrivers = choferes.filter((chofer) => chofer.conectado).slice(0, 3);
  const inactiveDrivers = choferes.filter((chofer) => !chofer.conectado).slice(0, 3);
  const rutaMapa = activeRoutes[0] || { nombre: 'Maica' };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Panel de Control</h1>
            <p className="page-subtitle">Resumen rápido de rutas activas, choferes conectados.</p>
          </div>
        </div>

        {loading ? (
          <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card shadow-sm h-100 border-0 rounded-4" style={{ minHeight: '300px' }}>
                  <div className="card-body p-0 rounded-4 overflow-hidden">
                    <MapaRutas rutaSeleccionada={rutaMapa} height="330px" />
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card shadow-sm h-100 border-0 rounded-4">
                  <div className="card-header text-center fw-bold text-white rounded-top-4" style={{ backgroundColor: '#8d8d8d' }}>
                    Rutas Activas
                  </div>
                  <ul className="list-group list-group-flush border-0">
                    {activeRoutes.length === 0 ? (
                      <li className="list-group-item border-0 text-muted">No hay rutas activas hoy.</li>
                    ) : (
                      activeRoutes.map((ruta) => (
                        <li key={ruta.id} className="list-group-item border-0">{ruta.nombre}</li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="col-lg-8">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-header text-center fw-bold text-white rounded-top-4" style={{ backgroundColor: '#8d8d8d' }}>
                    Choferes Activos / Inactivos
                  </div>
                  <div className="card-body">
                    <div className="row fs-5">
                      <div className="col-6 d-flex flex-column gap-3">
                        {activeDrivers.length === 0 ? (
                          <div className="text-muted">No hay choferes activos.</div>
                        ) : (
                          activeDrivers.map((chofer) => (
                            <div key={chofer.id} className="d-flex justify-content-between pe-4 align-items-center">
                              <span>{chofer.nombre_completo}</span>
                              <span className="text-success">🟢</span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="col-6 d-flex flex-column gap-3 border-start ps-4">
                        {inactiveDrivers.length === 0 ? (
                          <div className="text-muted">No hay choferes inactivos.</div>
                        ) : (
                          inactiveDrivers.map((chofer) => (
                            <div key={chofer.id} className="d-flex justify-content-between pe-4 align-items-center">
                              <span>{chofer.nombre_completo}</span>
                              <span className="text-danger">🔴</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="card-footer text-center bg-white border-0 rounded-bottom-4">
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card shadow-sm h-100 border-0 rounded-4">
                  <div className="card-body d-flex align-items-center justify-content-center bg-light rounded-4">
                    <h5 className="text-muted">📊 Aquí integraremos la librería de Gráficos</h5>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

    </div>
  );
};

export default Dashboard;