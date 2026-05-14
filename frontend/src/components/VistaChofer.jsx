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
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 p-0" style={{ backgroundColor: '#f4f6f9' }}>
      
      {/* ================= NAVBAR SUPERIOR ================= */}
      <nav className="navbar navbar-dark bg-dark shadow-sm px-3 py-3">
        <div className="d-flex align-items-center">
          <span className="fs-3 me-2">🚐</span>
          <div>
            <h5 className="mb-0 text-white fw-bold">Portal del Chofer</h5>
            <small className="text-light opacity-75">{sindicatoName}</small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end d-none d-sm-block">
            <p className="mb-0 text-white fw-bold">{userName || choferData?.nombre_completo || 'Chofer'}</p>
            <small className="text-success">🟢 Conectado</small>
          </div>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            🚪 Salir
          </button>
        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <div className="p-3 p-md-4">
        <div className="row g-4">
          
          {/* COLUMNA IZQUIERDA: Información del Viaje */}
          <div className="col-lg-4 col-md-5 d-flex flex-column gap-3">
            
            {/* Tarjeta de Estado Actual */}
            <div className="card shadow-sm border-0 rounded-4 p-3 border-start border-primary border-4">
              <h6 className="text-muted fw-bold mb-3">ESTADO ACTUAL</h6>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 small">En ruta hacia:</p>
                  <h3 className="fw-bold text-primary m-0">{destinoActual}</h3>
                </div>
                <span className="badge bg-success fs-6 px-3 py-2 rounded-pill shadow-sm">
                  {choferData?.estado_activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Tarjeta de Ruta Asignada */}
            <div className="card shadow-sm border-0 rounded-4 p-3 flex-grow-1">
              <h6 className="text-muted fw-bold mb-3">📍 RUTA ASIGNADA</h6>
              <ul className="list-group list-group-flush">
                {sortedRoutes.length === 0 ? (
                  <li className="list-group-item border-0 px-0 py-2 text-muted">No hay rutas asignadas para hoy.</li>
                ) : (
                  sortedRoutes.map((route, index) => {
                    const completada = !!route.completada;
                    const esActual = route.id === currentRoute?.id && !route.completada;

                    return (
                      <li key={index} className="list-group-item d-flex align-items-center border-0 px-0 py-2">
                        <div className="me-3 text-center" style={{ width: '24px' }}>
                          {completada ? (
                            <span className="text-success fs-5">✓</span>
                          ) : esActual ? (
                            <span className="text-primary fs-5">📍</span>
                          ) : (
                            <span className="text-muted opacity-50 fs-5">○</span>
                          )}
                        </div>
                        <span className={`fw-bold ${completada ? 'text-muted text-decoration-line-through' : esActual ? 'text-primary fs-5' : 'text-dark'}`}>
                          {formatRouteName(route)}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

          </div>
          <div className="col-lg-8 col-md-7 d-flex flex-column gap-3">
            <div className="card shadow-sm border-0 rounded-4 flex-grow-1 bg-white overflow-hidden" style={{ minHeight: '300px' }}>
              <MapaRutas rutaSeleccionada={currentRoute || { nombre: destinoActual || 'Maica' }} height="340px" />
            </div>
            {/* Botonera de Acción */}
            <div className="card shadow-sm border-0 rounded-4 p-3 bg-white">
              <div className="row g-2">
                <div className="col-sm-4">
                  <button className="btn btn-success w-100 fw-bold py-3 shadow-sm rounded-3" onClick={handleStartTrip} disabled={!currentRoute || loading}>
                    ▶️ Iniciar Viaje
                  </button>
                </div>
                <div className="col-sm-4">
                  <button className="btn btn-secondary w-100 fw-bold py-3 shadow-sm rounded-3" onClick={handleFinishRoute} disabled={!currentRoute || loading}>
                    ⏹️ Finalizar Ruta
                  </button>
                </div>
                <div className="col-sm-4">
                  <button className="btn btn-warning w-100 fw-bold py-3 shadow-sm rounded-3 text-dark" onClick={handleReportIncident} disabled={!currentRoute || loading}>
                    ⚠️ Incidentes
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