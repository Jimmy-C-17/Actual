import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import Sidebar from './Sidebar.jsx';

const Choferes = () => {
  const navigate = useNavigate();
  const { sidebarVisible, toggleSidebar, sindicatoName } = useUI();
  
  const [showModal, setShowModal] = useState(false);
  const [choferes, setChoferes] = useState([]); 
  const [grupos, setGrupos] = useState([]);
  const [formData, setFormData] = useState({    
    nombre_completo: '',
    ci: '',
    nro_socio: '',
    celular: '',
    password: '', 
    grupo: ''     
  });

  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    cargarChoferes();
    cargarGrupos();
  }, []);

  function cargarChoferes() {
    fetch('http://127.0.0.1:8000/api/choferes/')
      .then(response => response.json())
      .then(data => setChoferes(data))
      .catch(error => console.error("Error al cargar choferes:", error));
  }

  function cargarGrupos() {
    fetch('http://127.0.0.1:8000/api/grupos/')
      .then(response => response.json())
      .then(data => setGrupos(data))
      .catch(error => console.error("Error al cargar grupos:", error));
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const abrirModalCrear = () => {
    setFormData({ nombre_completo: '', ci: '', nro_socio: '', celular: '', password: '', grupo: '' });
    setEditandoId(null);
    setShowModal(true);
  };

  const abrirModalEditar = (chofer) => {
    setFormData({
      nombre_completo: chofer.nombre_completo,
      ci: chofer.ci,
      nro_socio: chofer.nro_socio,
      celular: chofer.celular,
      password: '',
      grupo: chofer.grupo || '' 
    });
    setEditandoId(chofer.id);
    setShowModal(true);
  };

  const handleGuardar = () => {
    const url = editandoId 
      ? `http://127.0.0.1:8000/api/choferes/${editandoId}/`
      : 'http://127.0.0.1:8000/api/choferes/';              
    
    const method = editandoId ? 'PUT' : 'POST';

    if (!editandoId && !formData.password) {
        showToast("La contraseña es obligatoria para crear un nuevo chofer.");
        return;
    }
    if (!formData.grupo) {
        showToast("Debes seleccionar un grupo para el chofer.");
        return;
    }
    const datosAEnviar = { ...formData };
    if (editandoId && !datosAEnviar.password) {
        delete datosAEnviar.password;
    }

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosAEnviar),
    })
    .then(async response => {
        if (!response.ok) {
            const contentType = response.headers.get('content-type') || '';
            const text = await response.text();
            if (contentType.includes('application/json')) {
                const errorData = JSON.parse(text || '{}');
                const mensaje = Object.entries(errorData)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join(' | ');
                throw new Error(mensaje || `Error ${response.status}`);
            }
            const htmlMessage = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            const match = htmlMessage.match(/IntegrityError.*?\)\./);
            throw new Error(match ? match[0] : (htmlMessage || `Error ${response.status}`));
        }
        return response.json();
    })
    .then(() => {
      cargarChoferes(); 
      setShowModal(false);
      if (!editandoId) {
        showToast("¡Chofer guardado con éxito y usuario creado!\n\nSu usuario de acceso será mostrado en la tabla.");
      } else {
        showToast("¡Chofer actualizado!");
      }
    })
    .catch(error => {
        console.error("Error al guardar:", error);
        showToast("Error al guardar el chofer. Revisa la consola o asegúrate de que el CI no esté duplicado.\nDetalles: " + error.message);
    });
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este chofer? Se eliminará también su acceso al sistema.")) {
      fetch(`http://127.0.0.1:8000/api/choferes/${id}/`, {
        method: 'DELETE',
      })
      .then(() => {
        cargarChoferes();
        showToast("Chofer eliminado.");
      })
      .catch(error => console.error("Error al eliminar:", error));
    }
  };

  const handleToggleEstado = (chofer) => {
    const nuevoEstado = !chofer.estado_activo;
    fetch(`http://127.0.0.1:8000/api/choferes/${chofer.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado_activo: nuevoEstado }),
    })
    .then(async response => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'No se pudo cambiar el estado del chofer.');
      }
      return response.json();
    })
    .then((updatedChofer) => {
      setChoferes((prev) => prev.map((item) => item.id === updatedChofer.id ? updatedChofer : item));
    })
    .catch(error => {
      console.error('Error al cambiar estado:', error);
      showToast('No se pudo habilitar/deshabilitar el chofer. Revisa la consola.');
    });
  };

  const choferesFiltrados = choferes.filter((chofer) => {
    const textoBuscado = busqueda.toLowerCase();
    const nombre = chofer.nombre_completo ? chofer.nombre_completo.toLowerCase() : '';
    const ci = chofer.ci ? chofer.ci.toString() : '';
    return nombre.includes(textoBuscado) || ci.includes(textoBuscado);
  });

  const obtenerNombreGrupo = (grupoId) => {
    if (!grupoId) return 'Sin Grupo';
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nombre : 'Desconocido';
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="m-0 fw-bold text-secondary">Gestión de Choferes</h2>
          </div>

          <div className="d-flex gap-3">
            <input 
              type="text" 
              className="form-control shadow-sm border-0" 
              placeholder="Buscar chofer..." 
              style={{ minWidth: '250px' }} 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <button 
              className="btn btn-dark shadow-sm text-nowrap" 
              style={{ backgroundColor: '#6c757d', border: 'none' }}
              onClick={abrirModalCrear}
            >
              + Agregar nuevo chofer
            </button>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <table className="table table-hover mb-0 text-center align-middle">
            <thead className="table-secondary">
              <tr><th className="py-3">Nombre y Apellido</th><th className="py-3">Carnet (CI)</th><th className="py-3">Usuario Acceso</th><th className="py-3">Numero de Socio</th><th className="py-3">Grupo</th><th className="py-3">Celular</th><th className="py-3">Habilitado</th><th className="py-3">Acciones</th></tr>
            </thead>
            <tbody>
              {choferesFiltrados.length === 0 ? (
                <tr><td colSpan="8" className="py-4 text-muted">No se encontraron choferes.</td></tr>
              ) : (
                choferesFiltrados.map((chofer) => (
                  <tr key={chofer.id}>
                    <td>{chofer.nombre_completo}</td>
                    <td>{chofer.ci}</td>
                    <td><code className="text-info">{chofer.usuario_acceso}</code></td>
                    <td>{chofer.nro_socio}</td>
                    <td><span className="badge bg-info text-dark">{obtenerNombreGrupo(chofer.grupo)}</span></td>
                    <td>{chofer.celular}</td>
                    <td className="text-center">
                      <div className="form-check form-switch d-flex justify-content-center align-items-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id={`estado-${chofer.id}`}
                          checked={chofer.estado_activo}
                          onChange={() => handleToggleEstado(chofer)}
                        />
                        <label className="form-check-label ms-2" htmlFor={`estado-${chofer.id}`}>{chofer.estado_activo ? 'Sí' : 'No'}</label>
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2 border-0" onClick={() => abrirModalEditar(chofer)} title="Editar">✏️</button>
                      <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleEliminar(chofer.id)} title="Eliminar">🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ================= VENTANA EMERGENTE (MODAL) ================= */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-secondary">
                  {editandoId ? "Editar Chofer" : "Registrar Nuevo Chofer"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Nombre y Apellido</label>
                    <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} className="form-control bg-light border-0" placeholder="Ej: Juan Pérez" />
                  </div>
                  
                  <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-bold text-muted">Carnet de Identidad</label>
                        <input type="text" name="ci" value={formData.ci} onChange={handleChange} className="form-control bg-light border-0" placeholder="Ej: 1234567" disabled={editandoId ? true : false} title={editandoId ? "El CI no se puede editar porque es el usuario" : ""} />
                        <small className="text-muted" style={{fontSize: '0.7em'}}>Será el usuario de acceso</small>
                      </div>
                      
                      {/* ---  CAMPO DE CONTRASEÑA --- */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-bold text-muted">Contraseña de Acceso</label>
                        <input type="text" name="password" value={formData.password} onChange={handleChange} className="form-control bg-light border-0" placeholder={editandoId ? "Dejar vacío para no cambiar" : "Ej: secreta123"} />
                      </div>
                  </div>

                  <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-bold text-muted">Número de Socio</label> 
                        <input type="text" name="nro_socio" value={formData.nro_socio} onChange={handleChange} className="form-control bg-light border-0" placeholder="Ej: 00125" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-bold text-muted">Número de Celular</label>
                        <input type="text" name="celular" value={formData.celular} onChange={handleChange} className="form-control bg-light border-0" placeholder="Ej: 77712345" />
                      </div>
                  </div>

                  {/* --- SELECTOR DE GRUPOS --- */}
                  <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Asignar a Grupo (Para Turnos)</label>
                      <select 
                          name="grupo" 
                          value={formData.grupo} 
                          onChange={handleChange} 
                          className="form-select bg-light border-0"
                      >
                          <option value="">-- Seleccione un Grupo --</option>
                          {grupos.map(g => (
                              <option key={g.id} value={g.id}>{g.nombre}</option>
                          ))}
                      </select>
                  </div>

                </form>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancelar</button>
                <button 
                  type="button" 
                  className="btn btn-success px-4" 
                  onClick={handleGuardar}>
                  {editandoId ? "Actualizar Chofer" : "Guardar y Crear Acceso"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Choferes;