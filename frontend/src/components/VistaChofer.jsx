import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import MapaRutas from './MapaRutas.jsx';

const VistaChofer = () => {
  const navigate = useNavigate();
  const { sindicatoName, userName, choferId, grupo, isConnected, logout } = useUI();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [choferData, setChoferData] = useState(null);
  const [rutasHoy, setRutasHoy] = useState([]);
  const [tripStarted, setTripStarted] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!isConnected || !choferId) {
      navigate('/');
      return;
    }

    const fetchPanelChofer = async () => {
      setLoading(true);
      setError('');
      setActionMessage('');

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/panel-chofer/${choferId}/`);
        if (!response.ok) {
          throw new Error('No se pudo cargar la información del chofer');
        }

        const data = await response.json();
        setChoferData(data.chofer);
        setRutasHoy(data.vueltas_hoy || []);
      } catch (err) {
        console.error(err);
        setError('Error al cargar la información del chofer.');
      } finally {
        setLoading(false);
      }
    };

    fetchPanelChofer();
  }, [choferId, isConnected, navigate]);

  const sortedRoutes = [...rutasHoy].sort((a, b) => (a.orden_vuelta || 0) - (b.orden_vuelta || 0));
  const currentRoute = sortedRoutes.find((route) => !route.completada) || sortedRoutes[sortedRoutes.length - 1];

  const formatRouteName = (route) => {
    if (!route) return 'Sin ruta asignada';
    return route.ruta_asignada_nombre || route.ruta_asignada?.nombre || route.ruta_asignada || 'Ruta';
  };

  const destinoActual = formatRouteName(currentRoute);

  const handleStartTrip = () => {
    if (!currentRoute) {
      setActionMessage('No hay una ruta activa para iniciar.');
      return;
    }

    setTripStarted(true);
    setActionMessage(`Viaje iniciado hacia ${destinoActual}`);
  };

  const handleFinishRoute = async () => {
    if (!currentRoute || currentRoute.completada) {
      setActionMessage('No hay ruta pendiente para finalizar.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/hojarutas/${currentRoute.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completada: true, fecha_completada: new Date().toISOString() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.detail || data?.error || 'No se pudo finalizar la ruta');
      }

      const updatedRoute = await response.json();
      setRutasHoy((prev) => prev.map((route) => (route.id === updatedRoute.id ? updatedRoute : route)));
      setActionMessage(`Ruta finalizada: ${formatRouteName(updatedRoute)}`);
      setTripStarted(false);
    } catch (err) {
      console.error(err);
      setError('Error al finalizar la ruta.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportIncident = async () => {
    if (!currentRoute) {
      setActionMessage('No hay ruta activa para reportar un incidente.');
      return;
    }

    const tipo = window.prompt('Tipo de incidente (ej: Avería, Tráfico, Avería mecánica):');
    if (!tipo || !tipo.trim()) return;

    const descripcion = window.prompt('Describe brevemente el incidente:');
    if (!descripcion || !descripcion.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/incidentes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruta: currentRoute.id, tipo: tipo.trim(), descripcion: descripcion.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.detail || data?.error || 'No se pudo reportar el incidente');
      }

      setActionMessage('Incidente reportado correctamente.');
    } catch (err) {
      console.error(err);
      setError('Error al reportar el incidente.');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && !choferData) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#1e1e1e' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 p-0" style={{ backgroundColor: '#1a1c1e', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ================= NAVBAR SUPERIOR (AZUL OSCURO) ================= */}
      <nav className="navbar px-4 py-3" style={{ backgroundColor: '#022d56', minHeight: 'auto' }}>
        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
          {/* Ícono de Bus Blanco con fondo celeste */}
          <div className="me-2 me-md-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#5c9af0', borderRadius: '10px', width: '40px', height: '40px', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 14v4c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <path d="M9 17h6"></path>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <h5 className="mb-0 text-white fw-bold" style={{ fontSize: '1rem' }}>Portal del chofer</h5>
            <small style={{ color: '#a0bce0', fontSize: '0.75rem', display: 'block' }}>{sindicatoName}</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 gap-md-4" style={{ flexShrink: 0 }}>
          <div className="text-end d-none d-md-block">
            <p className="mb-0 text-white fw-bold" style={{ fontSize: '0.95rem' }}>{userName || choferData?.nombre_completo || 'Chofer'}</p>
            <small style={{ color: '#4ade80', fontSize: '0.8rem' }}>● Conectado</small>
          </div>
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 rounded-pill px-2 px-md-3 py-1"
            onClick={handleLogout}
            style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', backgroundColor: 'transparent', fontSize: '0.85rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span className="d-none d-sm-inline">Salir</span>
          </button>
        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <div className="p-2 p-sm-3 p-md-4">
        <div className="row g-3 g-md-4">

          {/* COLUMNA IZQUIERDA */}
          <div className="col-12 col-lg-4 d-flex flex-column gap-3">
            
            {/* Tarjeta 1: Estado Actual */}
            <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: '#2d3034' }}>
              <h6 className="fw-bold mb-3" style={{ color: '#a0aab2', fontSize: '0.75rem', letterSpacing: '1px' }}>ESTADO ACTUAL</h6>
              <div className="mb-4">
                <p className="mb-1" style={{ color: '#c4c7c5', fontSize: '0.95rem' }}>En ruta hacia:</p>
                <h3 className="fw-bold m-0" style={{ color: '#669df6' }}>{destinoActual}</h3>
              </div>
              <div>
                <span 
                  className="badge px-3 py-2 rounded-pill" 
                  style={{ 
                    backgroundColor: '#e6f4ea', 
                    color: '#137333',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  ● {choferData?.estado_activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Tarjeta 2: Ruta Asignada */}
            <div className="card shadow-sm border-0 rounded-4 p-4 flex-grow-1" style={{ backgroundColor: '#2d3034' }}>
              <div className="d-flex align-items-center mb-3 gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0aab2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <h6 className="fw-bold m-0" style={{ color: '#a0aab2', fontSize: '0.75rem', letterSpacing: '1px' }}>RUTA ASIGNADA</h6>
              </div>
              
              <ul className="list-group list-group-flush bg-transparent">
                {sortedRoutes.length === 0 ? (
                  <li className="list-group-item border-0 px-0 py-2 bg-transparent" style={{ color: '#e8eaed' }}>
                    No hay rutas asignadas para hoy.
                  </li>
                ) : (
                  sortedRoutes.map((route, index) => {
                    const completada = !!route.completada;
                    const esActual = route.id === currentRoute?.id && !route.completada;

                    return (
                      <li key={index} className="list-group-item d-flex align-items-center border-0 px-0 py-2 bg-transparent">
                        <div className="me-3 text-center" style={{ width: '24px' }}>
                          {completada ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34a853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : esActual ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#669df6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round">
                              <circle cx="12" cy="12" r="5" />
                            </svg>
                          )}
                        </div>
                        <span 
                          style={{ 
                            fontWeight: esActual ? 'bold' : 'normal',
                            color: completada ? '#5f6368' : esActual ? '#669df6' : '#e8eaed',
                            textDecoration: completada ? 'line-through' : 'none'
                          }}
                        >
                          {formatRouteName(route)}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

          </div>

          {/* COLUMNA DERECHA */}
          <div className="col-12 col-lg-8 d-flex flex-column gap-3">
            
            {/* Contenedor del Mapa */}
            <div className="card shadow-sm border-0 rounded-4 flex-grow-1 overflow-hidden" style={{ backgroundColor: '#2d3034', minHeight: '300px' }}>
              <MapaRutas rutaSeleccionada={currentRoute || { nombre: destinoActual || 'Maica' }} height="340px" />
            </div>

            {/* Botonera de Acción (Gris Oscuro) */}
            <div className="card shadow-sm border-0 rounded-4 p-3" style={{ backgroundColor: '#2d3034' }}>
              <div className="row g-2">
                {/* Botón Iniciar Viaje */}
                <div className="col-12 col-sm-4">
                  <button
                    className="btn w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleStartTrip}
                    disabled={!currentRoute || loading}
                    style={{ backgroundColor: '#1f2023', color: '#fff', border: '1px solid #444', fontSize: '0.9rem' }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#383a3f'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#1f2023'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span className="d-none d-sm-inline">Iniciar viaje</span>
                    <span className="d-sm-none">Iniciar</span>
                  </button>
                </div>

                {/* Botón Finalizar Ruta */}
                <div className="col-12 col-sm-4">
                  <button
                    className="btn w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleFinishRoute}
                    disabled={!currentRoute || loading}
                    style={{ backgroundColor: '#1f2023', color: '#fff', border: '1px solid #444', fontSize: '0.9rem' }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#383a3f'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#1f2023'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    </svg>
                    <span className="d-none d-sm-inline">Finalizar ruta</span>
                    <span className="d-sm-none">Finalizar</span>
                  </button>
                </div>

                {/* Botón Incidentes */}
                <div className="col-12 col-sm-4">
                  <button
                    className="btn w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleReportIncident}
                    disabled={!currentRoute || loading}
                    style={{ backgroundColor: '#1f2023', color: '#fff', border: '1px solid #444', fontSize: '0.9rem' }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#383a3f'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#1f2023'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <span className="d-none d-sm-inline">Incidentes</span>
                    <span className="d-sm-none">Reporte</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default VistaChofer;