import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import Sidebar from './Sidebar.jsx';
import MapaRutas from './MapaRutas.jsx';

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
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <h2 className="mb-4 fw-bold text-secondary">Gestión de Rutas</h2>
        {rutaError && (
          <div className="alert alert-warning py-2" role="alert">
            {rutaError}
          </div>
        )}
        <div className="row g-4"> 
          {/* ================= COLUMNA IZQUIERDA ================= */}
          <div className="col-lg-5">
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
              <div className="row g-0">               
                {/* LISTA RUTAS ACTIVAS */}
                <div className="col-6 p-0 border-end">
                  <div className="bg-secondary text-white text-center py-2 fw-bold">Rutas Activas</div>
                  <ul className="list-group list-group-flush" style={{ height: '350px', overflowY: 'auto' }}>
                    {rutasActivas.map((ruta) => (
                      <li 
                        key={ruta.id} 
                        className={`list-group-item border-0 cursor-pointer ${rutaSeleccionada?.id === ruta.id ? 'bg-light fw-bold text-primary' : ''}`}
                        onClick={() => setRutaSeleccionada(ruta)}
                        style={{ cursor: 'pointer' }}
                      >
                        📍 {ruta.nombre}
                      </li>
                    ))}
                    {rutasActivas.length === 0 && <li className="list-group-item border-0 text-muted small text-center mt-3">Sin rutas activas</li>}
                  </ul>
                </div>
                {/* LISTA RUTAS INACTIVAS (BLOQUEADAS) */}
                <div className="col-6 p-0">
                  <div className="bg-secondary text-white text-center py-2 fw-bold" style={{ opacity: 0.8 }}>Rutas Inactivas</div>
                  <ul className="list-group list-group-flush bg-light" style={{ height: '350px', overflowY: 'auto' }}>
                    {rutasInactivas.map((ruta) => (
                      <li 
                        key={ruta.id} 
                        className={`list-group-item border-0 text-muted cursor-pointer bg-transparent ${rutaSeleccionada?.id === ruta.id ? 'fw-bold text-danger' : ''}`}
                        onClick={() => setRutaSeleccionada(ruta)}
                        style={{ cursor: 'pointer' }}
                      >
                        🚧 {ruta.nombre}
                      </li>
                    ))}
                    {rutasInactivas.length === 0 && <li className="list-group-item border-0 bg-transparent text-muted small text-center mt-3">Sin rutas bloqueadas</li>}
                  </ul>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-dark shadow-sm flex-grow-1" style={{ backgroundColor: '#6c757d', border: 'none' }} onClick={abrirModalCrear}>
                + Añadir
              </button>
              <button className="btn btn-outline-secondary shadow-sm flex-grow-1" onClick={abrirModalEditar} disabled={!rutaSeleccionada}>
                ✏️ Editar Estado
              </button>
              <button className="btn btn-outline-danger shadow-sm flex-grow-1" onClick={handleEliminarRuta} disabled={!rutaSeleccionada}>
                🗑️ Eliminar
              </button>
            </div>
          </div>
          {/* ================= COLUMNA DERECHA ================= */}
          <div className="col-lg-7 d-flex flex-column gap-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
              <div className="text-secondary small">
                {rutaSeleccionada
                  ? editingRouteMode
                    ? 'Haz clic en el mapa para añadir puntos de ruta. Guarda cuando termines.'
                    : 'Pulsa "Editar recorrido" para definir el camino desde el inicio.'
                  : 'Selecciona una ruta para empezar a editarla.'}
              </div>
              <div className="btn-group">
                <button
                  className={`btn ${editingRouteMode ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                  onClick={handleToggleRouteEdit}
                  disabled={!rutaSeleccionada}
                >
                  {editingRouteMode ? 'Cancelar edición' : 'Editar recorrido'}
                </button>
                {editingRouteMode && (
                  <>
                    <button
                      className="btn btn-outline-success"
                      onClick={handleSaveRoutePoints}
                      disabled={routePoints.length === 0}
                    >
                      Guardar recorrido
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleClearRoutePoints}
                    >
                      Limpiar
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ minHeight: '200px' }}>
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
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <table className="table mb-0 text-center align-middle">
                <thead className="table-secondary">
                  <tr>
                    <th className="py-3 text-start ps-4">Choferes actualmente en ruta:</th>
                    <th className="py-3 text-center text-primary fs-5">{rutaSeleccionada?.nombre || 'Ninguna seleccionada'}</th>
                  </tr>
                </thead>
                <tbody>
                  {hojasDeRutaSeleccionada.length > 0 ? (
                    hojasDeRutaSeleccionada.map((hoja) => (
                      <tr key={hoja.id}>
                        <td className="text-start ps-4 fs-6 fw-bold text-dark">
                          👨‍✈️ {getNombreChofer(typeof hoja.chofer === 'object' ? hoja.chofer?.id : hoja.chofer)}
                        </td>
                        <td className="text-center">
                          {hoja.completada ? (
                            <span className="badge bg-secondary px-3 py-2">Finalizó</span>
                          ) : (
                            <span className="badge bg-success px-3 py-2">En curso</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-muted py-4">
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
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-secondary">
                  {editandoRutaId ? "Editar Estado de la Ruta" : "Crear Nueva Ruta"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Nombre / Destino de la Ruta</label>
                    <input 
                      type="text" 
                      name="nombre" 
                      value={formData.nombre} 
                      onChange={handleChange} 
                      className="form-control bg-light border-0" 
                      placeholder="Ej: Cochabamba, Maica, etc." 
                      autoFocus
                    />
                  </div>
                  <div className="form-check form-switch mt-4 bg-light p-3 rounded-3 d-flex align-items-center">
                    <input 
                      className="form-check-input ms-0 me-3 mt-0" 
                      type="checkbox" 
                      role="switch" 
                      style={{ transform: 'scale(1.3)' }}
                      name="activa" 
                      checked={formData.activa} 
                      onChange={handleChange} 
                    />
                    <label className="form-check-label fw-bold text-dark mb-0">
                      {formData.activa ? "🟢 Ruta Activa y Disponible" : "🔴 Ruta Inactiva / Bloqueada"}
                    </label>
                  </div>
                  <div className="form-text small text-muted mt-2">
                    Si desactivas la ruta, no aparecerá como opción al crear una hoja de ruta para los choferes.
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 pt-0 mt-3">
                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-success px-4" onClick={handleGuardarRuta}>
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