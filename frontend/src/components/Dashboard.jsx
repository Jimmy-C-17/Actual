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

  // Variables derivadas para las tarjetas superiores (sin alterar estados)
  const totalRutasActivas = activeRoutes.length;
  const resumenRutas = activeRoutes.length > 0 ? activeRoutes.map(r => r.nombre).join(', ').substring(0, 30) + (activeRoutes.map(r => r.nombre).join(', ').length > 30 ? '...' : '') : 'Ninguna activa';
  const totalChoferesActivos = activeDrivers.length;
  const totalChoferes = choferes.length;
  const totalInactivos = choferes.filter((c) => !c.conectado).length;

  return (
    <div className="app-shell d-flex" style={{ backgroundColor: '#1a1c1e', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Sidebar />

      <main className="app-main flex-grow-1 p-4" style={{ backgroundColor: '#1a1c1e', marginLeft: sidebarVisible ? '240px' : '80px' }}>
        
        {/* ENCABEZADO */}
        <div className="mb-4">
          <h2 className="fw-bold text-white mb-1" style={{ fontSize: '1.8rem' }}>Panel de control</h2>
          <p className="mb-0" style={{ color: '#a0aab2' }}>Resumen de rutas activas y choferes conectados</p>
        </div>

        {loading ? (
          <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
            <div className="spinner-border" style={{ color: '#669df6' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <>
            {error && <div className="alert alert-danger border-0 rounded-4 shadow-sm">{error}</div>}
            
            {/* ================= FILA 1: TARJETAS DE MÉTRICAS ================= */}
            <div className="row g-3 mb-4">
              {/* Tarjeta 1: Rutas Activas */}
              <div className="col-md-3 col-sm-6">
                <div className="card h-100 border-0 rounded-4 p-3 shadow-sm" style={{ backgroundColor: '#2d3034' }}>
                  <h6 className="mb-2" style={{ color: '#a0aab2', fontSize: '0.85rem' }}>Rutas activas</h6>
                  <h2 className="fw-bold mb-2" style={{ color: '#669df6' }}>{totalRutasActivas}</h2>
                  <small style={{ color: '#e8eaed', fontSize: '0.8rem', lineHeight: '1.2' }}>{resumenRutas}</small>
                </div>
              </div>

              {/* Tarjeta 2: Choferes Activos */}
              <div className="col-md-3 col-sm-6">
                <div className="card h-100 border-0 rounded-4 p-3 shadow-sm" style={{ backgroundColor: '#2d3034' }}>
                  <h6 className="mb-2" style={{ color: '#a0aab2', fontSize: '0.85rem' }}>Choferes activos</h6>
                  <h2 className="fw-bold mb-2" style={{ color: '#34a853' }}>{totalChoferesActivos}</h2>
                  {totalChoferesActivos === 0 ? (
                    <small style={{ color: '#ea4335', fontSize: '0.8rem' }}>Sin actividad hoy</small>
                  ) : (
                    <small style={{ color: '#34a853', fontSize: '0.8rem' }}>● En ruta</small>
                  )}
                </div>
              </div>

              {/* Tarjeta 3: Vehículos (Marcador) */}
              <div className="col-md-3 col-sm-6">
                <div className="card h-100 border-0 rounded-4 p-3 shadow-sm" style={{ backgroundColor: '#2d3034' }}>
                  <h6 className="mb-2" style={{ color: '#a0aab2', fontSize: '0.85rem' }}>Vehículos</h6>
                  <h2 className="fw-bold mb-2" style={{ color: '#669df6' }}>--</h2>
                  <small style={{ color: '#e8eaed', fontSize: '0.8rem' }}>Registrados</small>
                </div>
              </div>

              {/* Tarjeta 4: Total Choferes */}
              <div className="col-md-3 col-sm-6">
                <div className="card h-100 border-0 rounded-4 p-3 shadow-sm" style={{ backgroundColor: '#2d3034' }}>
                  <h6 className="mb-2" style={{ color: '#a0aab2', fontSize: '0.85rem' }}>Total choferes</h6>
                  <h2 className="fw-bold mb-2 text-white">{totalChoferes}</h2>
                  <small style={{ color: '#ea4335', fontSize: '0.8rem' }}>● {totalInactivos} Inactivos</small>
                </div>
              </div>
            </div>

            {/* ================= FILA 2: MAPA Y LISTA DE RUTAS ================= */}
            <div className="row g-4 mb-4">
              {/* Columna Izquierda: Mapa */}
              <div className="col-lg-8">
                <div className="card shadow-sm h-100 border-0 rounded-4" style={{ backgroundColor: '#2d3034', minHeight: '300px' }}>
                  <div className="card-body p-0 rounded-4 overflow-hidden">
                    <MapaRutas rutaSeleccionada={rutaMapa} height="330px" />
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Rutas Activas (Lista) */}
              <div className="col-lg-4">
                <div className="card shadow-sm h-100 border-0 rounded-4 p-3" style={{ backgroundColor: '#2d3034' }}>
                  <h6 className="fw-bold mb-3" style={{ color: '#e8eaed', fontSize: '0.9rem' }}>Rutas activas</h6>
                  <ul className="list-group list-group-flush bg-transparent border-0">
                    {activeRoutes.length === 0 ? (
                      <li className="list-group-item border-0 px-0 py-2 bg-transparent text-muted">No hay rutas activas hoy.</li>
                    ) : (
                      activeRoutes.map((ruta) => (
                        <li key={ruta.id} className="list-group-item border-0 px-0 py-2 bg-transparent d-flex align-items-center fw-bold" style={{ color: '#e8eaed' }}>
                          <span className="me-2" style={{ color: '#34a853', fontSize: '0.8rem' }}>●</span>
                          {ruta.nombre}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* ================= FILA 3: LISTAS DE CHOFERES Y GRÁFICOS ================= */}
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card shadow-sm border-0 rounded-4 h-100 p-3" style={{ backgroundColor: '#2d3034' }}>
                  <h6 className="fw-bold mb-3" style={{ color: '#e8eaed', fontSize: '0.9rem' }}>Choferes Activos / Inactivos</h6>
                  <div className="card-body p-0">
                    <div className="row fs-6">
                      
                      {/* Lista de Activos */}
                      <div className="col-6 d-flex flex-column gap-3">
                        {activeDrivers.length === 0 ? (
                          <div className="text-muted" style={{ fontSize: '0.85rem' }}>No hay choferes activos.</div>
                        ) : (
                          activeDrivers.map((chofer) => (
                            <div key={chofer.id} className="d-flex justify-content-between pe-3 align-items-center">
                              <span style={{ color: '#c4c7c5' }}>{chofer.nombre_completo}</span>
                              <span style={{ color: '#34a853', fontSize: '0.7rem' }}>●</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Lista de Inactivos */}
                      <div className="col-6 d-flex flex-column gap-3 border-start ps-4" style={{ borderColor: '#444 !important' }}>
                        {inactiveDrivers.length === 0 ? (
                          <div className="text-muted" style={{ fontSize: '0.85rem' }}>No hay choferes inactivos.</div>
                        ) : (
                          inactiveDrivers.map((chofer) => (
                            <div key={chofer.id} className="d-flex justify-content-between pe-3 align-items-center">
                              <span style={{ color: '#c4c7c5' }}>{chofer.nombre_completo}</span>
                              <span style={{ color: '#ea4335', fontSize: '0.7rem' }}>●</span>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card shadow-sm h-100 border-0 rounded-4" style={{ backgroundColor: '#2d3034' }}>
                  <div className="card-body d-flex align-items-center justify-content-center">
                    <div className="text-center">
                      <div className="mb-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', margin: '0 auto', backgroundColor: '#111827', borderRadius: '18px' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#669df6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19h16"></path>
                          <path d="M5 15h3"></path>
                          <path d="M10 11h3"></path>
                          <path d="M15 7h3"></path>
                          <path d="M8 19V9"></path>
                          <path d="M13 19V5"></path>
                          <path d="M18 19V13"></path>
                        </svg>
                      </div>
                      <h6 style={{ color: '#a0aab2' }}>Espacio para gráficos</h6>
                    </div>
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