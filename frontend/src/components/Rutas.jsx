import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import Sidebar from './Sidebar.jsx';
import MapaRutas from './MapaRutas.jsx';

// Función auxiliar para iniciales
const getInitials = (name) => {
  if (!name) return 'S/N';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const Rutas = () => {
  const navigate = useNavigate();
  const { sidebarVisible, toggleSidebar, sindicatoName, showToast } = useUI();
  const [rutasCatalogo, setRutasCatalogo] = useState([]);
  const [hojasRuta, setHojasRuta] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [rutaError, setRutaError] = useState(null);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editandoRutaId, setEditandoRutaId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    activa: true
  });
  const [routePoints, setRoutePoints] = useState([]);
  const [editingRouteMode, setEditingRouteMode] = useState(false);

  function cargarDatosDinamicos() {
    fetch('http://127.0.0.1:8000/api/rutas-catalogo/')
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar las rutas del backend');
        return res.json();
      })
      .then(data => {
        setRutasCatalogo(data);
        if (!rutaSeleccionada && data.length > 0) {
          setRutaSeleccionada(data[0]);
        }
        setRutaError(null);
      })
      .catch(err => {
        console.error('Error al cargar rutas:', err);
        setRutaError('No se pudieron cargar las rutas del servidor. Usa la simulación o revisa la API.');
        setRutasCatalogo([]);
      });

    fetch('http://127.0.0.1:8000/api/hojarutas/')
      .then(res => res.json())
      .then(data => setHojasRuta(data))
      .catch(err => console.error("Error al cargar hojas de ruta:", err));

    fetch('http://127.0.0.1:8000/api/choferes/')
      .then(res => res.json())
      .then(data => setChoferes(data))
      .catch(err => console.error("Error al cargar choferes:", err));
  }

  useEffect(() => {
    cargarDatosDinamicos();
  }, []);

  useEffect(() => {
    if (rutaSeleccionada) {
      setRoutePoints(Array.isArray(rutaSeleccionada.coordenadas) ? rutaSeleccionada.coordenadas : []);
      setEditingRouteMode(false);
    } else {
      setRoutePoints([]);
      setEditingRouteMode(false);
    }
  }, [rutaSeleccionada]);

  const rutasActivas = rutasCatalogo.filter(r => r.activa);
  const rutasInactivas = rutasCatalogo.filter(r => !r.activa);
  const hojasDeRutaSeleccionada = rutaSeleccionada 
    ? hojasRuta.filter(hoja => hoja.ruta_asignada === rutaSeleccionada.id)
    : [];

  const getNombreChofer = (choferId) => {
    const chofer = choferes.find(c => c.id === choferId);
    return chofer ? chofer.nombre_completo : 'Sin asignar';
  };

  const handleAddPoint = (point) => {
    setRoutePoints((prev) => [...prev, point]);
  };

  const handleToggleRouteEdit = () => {
    if (!rutaSeleccionada) return showToast('Selecciona una ruta primero para editarla.');
    setEditingRouteMode((prev) => !prev);
  };

  const handleClearRoutePoints = () => {
    setRoutePoints([]);
  };

  const handleSaveRoutePoints = async () => {
    if (!rutaSeleccionada) return showToast('Selecciona una ruta primero.');
    if (routePoints.length === 0) return showToast('Agrega al menos un punto en el mapa antes de guardar.');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/rutas-catalogo/${rutaSeleccionada.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordenadas: routePoints }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar las coordenadas de la ruta.');
      }

      const updatedRoute = await response.json();
      setRutaSeleccionada(updatedRoute);
      setRutasCatalogo((prev) => prev.map((ruta) => (ruta.id === updatedRoute.id ? updatedRoute : ruta)));
      setEditingRouteMode(false);
      showToast('Recorrido guardado correctamente.', 'success');
    } catch (error) {
      console.error(error);
      showToast('No se pudo guardar el recorrido. Revisa la conexión al servidor.', 'danger');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const abrirModalCrear = () => {
    setFormData({ nombre: '', activa: true });
    setEditandoRutaId(null);
    setShowModal(true);
  };

  const abrirModalEditar = () => {
    if (!rutaSeleccionada) return;
    setFormData({ nombre: rutaSeleccionada.nombre, activa: rutaSeleccionada.activa });
    setEditandoRutaId(rutaSeleccionada.id);
    setShowModal(true);
  };

  const handleGuardarRuta = () => {
    if (!formData.nombre.trim()) return showToast("El nombre de la ruta es obligatorio.");

    const cuerpo = { nombre: formData.nombre.trim(), activa: formData.activa };

    if (editandoRutaId) {
      fetch(`http://127.0.0.1:8000/api/rutas-catalogo/${editandoRutaId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo)
      })
      .then(res => {
        if (!res.ok) throw new Error('Error al actualizar la ruta');
        return res.json();
      })
      .then(() => {
        cargarDatosDinamicos();
        setShowModal(false);
      })
      .catch(err => {
        console.error(err);
        showToast('No se pudo actualizar la ruta. Revisa la conexión al servidor.');
      });
    } else {
      fetch('http://127.0.0.1:8000/api/rutas-catalogo/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo)
      })
      .then(res => {
        if (!res.ok) throw new Error('Error al crear la ruta');
        return res.json();
      })
      .then(() => {
        cargarDatosDinamicos();
        setShowModal(false);
      })
      .catch(err => {
        console.error(err);
        showToast('No se pudo crear la ruta. Revisa la conexión al servidor.');
      });
    }
  };

  const handleEliminarRuta = () => {
    if (!rutaSeleccionada) return showToast("Selecciona una ruta primero.");
    if (!window.confirm(`¿Estás seguro de ELIMINAR por completo la ruta "${rutaSeleccionada.nombre}"?`)) return;

    fetch(`http://127.0.0.1:8000/api/rutas-catalogo/${rutaSeleccionada.id}/`, {
      method: 'DELETE'
    })
    .then(res => {
      if (res.ok) {
        cargarDatosDinamicos();
        setRutaSeleccionada(null);
      } else {
        throw new Error('Error al eliminar la ruta');
      }
    })
    .catch(err => {
      console.error(err);
      showToast('No se pudo eliminar la ruta. Revisa la conexión al servidor.');
    });
  };

  return (
    <div className="app-shell" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: '#fff' }}>
      <Sidebar />

      <main className="app-main p-4" style={{ marginLeft: sidebarVisible ? '240px' : '80px' }}>
        <h2 className="mb-4 fw-bold text-white">Gestión de Rutas</h2>
        {rutaError && (
          <div className="alert border-0 py-2" style={{ backgroundColor: '#442a10', color: '#ffa85c' }} role="alert">
            {rutaError}
          </div>
        )}
        <div className="row g-4"> 
          {/* ================= COLUMNA IZQUIERDA ================= */}
          <div className="col-lg-5">
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4" style={{ backgroundColor: '#242424' }}>
              <div className="row g-0">               
                {/* LISTA RUTAS ACTIVAS */}
                <div className="col-6 p-0" style={{ borderRight: '1px solid #333' }}>
                  <div className="text-white text-center py-2 fw-bold" style={{ backgroundColor: '#2b2b2b' }}>Rutas Activas</div>
                  <ul className="list-group list-group-flush" style={{ height: '350px', overflowY: 'auto' }}>
                    {rutasActivas.map((ruta) => (
                      <li 
                        key={ruta.id} 
                        className="list-group-item border-0 d-flex align-items-center gap-2"
                        onClick={() => setRutaSeleccionada(ruta)}
                        style={{ 
                          cursor: 'pointer', 
                          backgroundColor: rutaSeleccionada?.id === ruta.id ? '#0d6efd20' : 'transparent',
                          color: rutaSeleccionada?.id === ruta.id ? '#58a6ff' : '#bbb',
                          borderBottom: '1px solid #333'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                        </svg>
                        <span className={rutaSeleccionada?.id === ruta.id ? 'fw-bold' : ''}>{ruta.nombre}</span>
                      </li>
                    ))}
                    {rutasActivas.length === 0 && <li className="list-group-item border-0 text-muted small text-center mt-3 bg-transparent">Sin rutas activas</li>}
                  </ul>
                </div>
                {/* LISTA RUTAS INACTIVAS (BLOQUEADAS) */}
                <div className="col-6 p-0">
                  <div className="text-white text-center py-2 fw-bold" style={{ backgroundColor: '#2b2b2b', opacity: 0.8 }}>Rutas Inactivas</div>
                  <ul className="list-group list-group-flush" style={{ height: '350px', overflowY: 'auto', backgroundColor: '#1e1e1e' }}>
                    {rutasInactivas.map((ruta) => (
                      <li 
                        key={ruta.id} 
                        className="list-group-item border-0 d-flex align-items-center gap-2"
                        onClick={() => setRutaSeleccionada(ruta)}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: rutaSeleccionada?.id === ruta.id ? '#dc354520' : 'transparent',
                          color: rutaSeleccionada?.id === ruta.id ? '#ff7b72' : '#777',
                          borderBottom: '1px solid #333'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                        </svg>
                        <span className={rutaSeleccionada?.id === ruta.id ? 'fw-bold' : ''}>{ruta.nombre}</span>
                      </li>
                    ))}
                    {rutasInactivas.length === 0 && <li className="list-group-item border-0 text-muted small text-center mt-3 bg-transparent">Sin rutas bloqueadas</li>}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <button 
                className="btn d-flex align-items-center justify-content-center gap-2 flex-grow-1 shadow-sm" 
                style={{ backgroundColor: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '8px' }} 
                onClick={abrirModalCrear}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                </svg>
                Añadir
              </button>
              <button 
                className="btn d-flex align-items-center justify-content-center gap-2 flex-grow-1 shadow-sm transition" 
                style={{ border: '1px solid #555', backgroundColor: 'transparent', color: rutaSeleccionada ? '#bbb' : '#555', borderRadius: '8px' }}
                onClick={abrirModalEditar} 
                disabled={!rutaSeleccionada}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                </svg>
                Editar Estado
              </button>
              <button 
                className="btn d-flex align-items-center justify-content-center gap-2 flex-grow-1 shadow-sm transition" 
                style={{ border: '1px solid #dc3545', backgroundColor: 'transparent', color: rutaSeleccionada ? '#dc3545' : '#555', borderRadius: '8px' }}
                onClick={handleEliminarRuta} 
                disabled={!rutaSeleccionada}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
                Eliminar
              </button>
            </div>
          </div>

          {/* ================= COLUMNA DERECHA ================= */}
          <div className="col-lg-7 d-flex flex-column gap-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
              <div className="small" style={{ color: '#bbb' }}>
                {rutaSeleccionada
                  ? editingRouteMode
                    ? 'Haz clic en el mapa para añadir puntos de ruta. Guarda cuando termines.'
                    : 'Pulsa "Editar recorrido" para definir el camino desde el inicio.'
                  : 'Selecciona una ruta para empezar a editarla.'}
              </div>
              <div className="btn-group">
                <button
                  className="btn"
                  style={{ 
                    border: `1px solid ${editingRouteMode ? '#dc3545' : '#0d6efd'}`, 
                    color: editingRouteMode ? '#dc3545' : '#58a6ff',
                    backgroundColor: 'transparent'
                  }}
                  onClick={handleToggleRouteEdit}
                  disabled={!rutaSeleccionada}
                >
                  {editingRouteMode ? 'Cancelar edición' : 'Editar recorrido'}
                </button>
                {editingRouteMode && (
                  <>
                    <button
                      className="btn"
                      style={{ border: '1px solid #198754', color: '#198754', backgroundColor: 'transparent' }}
                      onClick={handleSaveRoutePoints}
                      disabled={routePoints.length === 0}
                    >
                      Guardar recorrido
                    </button>
                    <button
                      className="btn"
                      style={{ border: '1px solid #6c757d', color: '#bbb', backgroundColor: 'transparent' }}
                      onClick={handleClearRoutePoints}
                    >
                      Limpiar
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ minHeight: '200px', backgroundColor: '#242424' }}>
              <div className="card-body p-0">
                <MapaRutas
                  rutaSeleccionada={rutaSeleccionada || { nombre: 'Maica' }}
                  points={routePoints}
                  editable={editingRouteMode}
                  onAddPoint={handleAddPoint}
                  height="260px"
                />
              </div>
            </div>
            
            {/* Tabla de Choferes en la Ruta Seleccionada */}
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#242424' }}>
              <table className="table table-dark mb-0 align-middle" style={{ backgroundColor: 'transparent', '--bs-table-bg': 'transparent' }}>
                <thead style={{ borderBottom: '1px solid #333' }}>
                  <tr>
                    <th className="py-3 text-start ps-4 fw-normal text-secondary">Choferes actualmente en ruta:</th>
                    <th className="py-3 text-center fw-bold" style={{ color: '#58a6ff', fontSize: '1.1rem' }}>
                      {rutaSeleccionada?.nombre || 'Ninguna seleccionada'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hojasDeRutaSeleccionada.length > 0 ? (
                    hojasDeRutaSeleccionada.map((hoja) => {
                      const nombre = getNombreChofer(typeof hoja.chofer === 'object' ? hoja.chofer?.id : hoja.chofer);
                      return (
                        <tr key={hoja.id} style={{ borderBottom: '1px solid #333' }}>
                          <td className="text-start ps-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-circle bg-white text-dark d-flex justify-content-center align-items-center fw-bold shadow-sm" 
                                   style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                                {getInitials(nombre)}
                              </div>
                              <span className="text-white fw-bold">{nombre}</span>
                            </div>
                          </td>
                          <td className="text-center">
                            {hoja.completada ? (
                              <span className="badge px-3 py-2" style={{ backgroundColor: '#444', color: '#bbb' }}>Finalizó</span>
                            ) : (
                              <span className="badge px-3 py-2" style={{ backgroundColor: '#198754', color: '#fff' }}>En curso</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-muted py-4 text-center">
                        {rutaSeleccionada 
                          ? rutaSeleccionada.activa 
                            ? 'No hay choferes recorriendo esta ruta en este momento.' 
                            : 'Nadie puede recorrer esta ruta porque está bloqueada.'
                          : 'Haz clic en una ruta de la lista.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      {/* ================= MODAL CREAR / EDITAR RUTA ================= */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4" style={{ backgroundColor: '#2b2b2b', color: '#fff' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-white">
                  {editandoRutaId ? "Editar Estado de la Ruta" : "Crear Nueva Ruta"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Nombre / Destino de la Ruta</label>
                    <input 
                      type="text" 
                      name="nombre" 
                      value={formData.nombre} 
                      onChange={handleChange} 
                      className="form-control border-0 text-light" 
                      style={{ backgroundColor: '#1a1a1a' }}
                      placeholder="Ej: Cochabamba, Maica, etc." 
                      autoFocus
                    />
                  </div>
                  <div className="form-check form-switch mt-4 p-3 rounded-3 d-flex align-items-center" style={{ backgroundColor: '#1a1a1a' }}>
                    <input 
                      className="form-check-input ms-0 me-3 mt-0" 
                      type="checkbox" 
                      role="switch" 
                      style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                      name="activa" 
                      checked={formData.activa} 
                      onChange={handleChange} 
                    />
                    <label className="form-check-label fw-bold text-white mb-0" style={{ cursor: 'pointer' }}>
                      {formData.activa ? "Ruta Activa y Disponible" : "Ruta Inactiva / Bloqueada"}
                    </label>
                  </div>
                  <div className="form-text small mt-2" style={{ color: '#888' }}>
                    Si desactivas la ruta, no aparecerá como opción al crear una hoja de ruta para los choferes.
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 pt-0 mt-3">
                <button type="button" className="btn" style={{ color: '#bbb' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary px-4 rounded-pill" style={{ backgroundColor: '#0d6efd', border: 'none' }} onClick={handleGuardarRuta}>
                  {editandoRutaId ? "Actualizar Ruta" : "Guardar Ruta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};
export default Rutas;