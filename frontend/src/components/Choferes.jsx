import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import Sidebar from './Sidebar.jsx';

const Choferes = () => {
  const navigate = useNavigate();
  const { sidebarVisible, toggleSidebar, sindicatoName, showToast } = useUI();
  
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
        showToast("La contraseña es obligatoria para crear un nuevo chofer.", 'warning');
        return;
    }
    if (!formData.grupo) {
        showToast("Debes seleccionar un grupo para el chofer.", 'warning');
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
        showToast("Chofer guardado con éxito y usuario creado.", 'success');
      } else {
        showToast("Chofer actualizado correctamente.", 'success');
      }
    })
    .catch(error => {
        console.error("Error al guardar:", error);
        showToast("Error al guardar el chofer. Revisa la consola o el CI.", 'error');
    });
  };

  const handleEliminar = (id) => {
    fetch(`http://127.0.0.1:8000/api/choferes/${id}/`, {
      method: 'DELETE',
    })
    .then(() => {
      cargarChoferes();
      showToast("Chofer eliminado.", 'success');
    })
    .catch(error => console.error("Error al eliminar:", error));
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
      showToast('No se pudo habilitar/deshabilitar el chofer. Revisa la consola.', 'error');
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

  // Función para obtener las iniciales del nombre
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="app-shell d-flex" style={{ backgroundColor: '#1a1c1e', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Sidebar />

      <main className="app-main flex-grow-1 p-4" style={{ backgroundColor: '#1a1c1e', marginLeft: sidebarVisible ? '240px' : '80px' }}>
        
        {/* ENCABEZADO Y BUSCADOR */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-white mb-0" style={{ fontSize: '1.8rem' }}>Gestión de choferes</h2>
          </div>

          <div className="d-flex gap-3 align-items-center">
            <div className="position-relative">
              <span className="position-absolute" style={{ color: '#9aa0a6', left: '15px', top: '50%', transform: 'translateY(-50%)' }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                className="form-control rounded-pill px-5" 
                placeholder="Buscar chofer..." 
                style={{ minWidth: '250px', backgroundColor: '#2d3034', border: '1px solid #444', color: '#e8eaed' }} 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <button 
              className="btn rounded-pill px-4 text-white d-flex align-items-center gap-2" 
              style={{ backgroundColor: 'transparent', border: '1px solid #5f6368' }}
              onClick={abrirModalCrear}
            >
              + Agregar chofer
            </button>
          </div>
        </div>

        {/* TABLA DE DATOS */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#2d3034' }}>
          <div className="table-responsive">
            <table className="table table-borderless mb-0 text-start align-middle bg-transparent">
              <thead style={{ borderBottom: '1px solid #444' }}>
                <tr>
                  <th className="py-3 px-4 fw-normal bg-transparent" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Nombre y apellido</th>
                  <th className="py-3 fw-normal bg-transparent" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Carnet (CI)</th>
                  <th className="py-3 fw-normal bg-transparent" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Usuario acceso</th>
                  <th className="py-3 fw-normal bg-transparent" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Nº socio</th>
                  <th className="py-3 fw-normal bg-transparent" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Grupo</th>
                  <th className="py-3 fw-normal bg-transparent" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Celular</th>
                  <th className="py-3 fw-normal bg-transparent" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Estado</th>
                  <th className="py-3 fw-normal bg-transparent text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {choferesFiltrados.length === 0 ? (
                  <tr><td colSpan="8" className="py-4 text-center bg-transparent" style={{ color: '#9aa0a6' }}>No se encontraron choferes.</td></tr>
                ) : (
                  choferesFiltrados.map((chofer) => (
                    <tr
                    key={chofer.id}
                    onClick={(e) => {
                      if (!e.target.closest('button')) abrirModalEditar(chofer);
                    }}
                    style={{
                      borderBottom: '1px solid #3a3d40',
                      backgroundColor: chofer.id === editandoId ? '#212830' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                      <td className="py-3 px-4 bg-transparent d-flex align-items-center" style={{ color: '#e8eaed' }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold shadow-sm" style={{ width: '38px', height: '38px', backgroundColor: '#ffffff', color: '#002d5c', fontSize: '0.85rem' }}>
                          {getInitials(chofer.nombre_completo)}
                        </div>
                        {chofer.nombre_completo}
                      </td>
                      <td className="py-3 bg-transparent" style={{ color: '#e8eaed' }}>{chofer.ci}</td>
                      <td className="py-3 bg-transparent" style={{ color: '#669df6' }}>{chofer.usuario_acceso}</td>
                      <td className="py-3 bg-transparent" style={{ color: '#e8eaed' }}>{chofer.nro_socio}</td>
                      <td className="py-3 bg-transparent">
                        <span className="badge rounded-pill text-dark px-3 py-2 fw-bold" style={{ backgroundColor: '#ffffff' }}>
                          {obtenerNombreGrupo(chofer.grupo)}
                        </span>
                      </td>
                      <td className="py-3 bg-transparent" style={{ color: '#e8eaed' }}>{chofer.celular}</td>
                      <td className="py-3 bg-transparent">
                        <div className="form-check form-switch d-flex align-items-center m-0">
                          <input
                            className="form-check-input shadow-none"
                            type="checkbox"
                            role="switch"
                            checked={chofer.estado_activo}
                            onChange={() => handleToggleEstado(chofer)}
                            style={{ cursor: 'pointer', backgroundColor: chofer.estado_activo ? '#34a853' : '#5f6368', borderColor: chofer.estado_activo ? '#34a853' : '#5f6368', width: '2.5rem', height: '1.25rem' }}
                          />
                        </div>
                      </td>
                      <td className="py-3 bg-transparent text-end pe-4">
                        <button 
                          className="btn btn-sm me-2 border-0 d-inline-flex align-items-center justify-content-center" 
                          onClick={() => abrirModalEditar(chofer)} 
                          title="Editar" 
                          style={{ background: 'none', color: '#f28b82', padding: '0.25rem' }}
                        >
                          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          className="btn btn-sm border-0 d-inline-flex align-items-center justify-content-center" 
                          onClick={() => handleEliminar(chofer.id)} 
                          title="Eliminar" 
                          style={{ background: 'none', color: '#9aa0a6', padding: '0.25rem' }}
                        >
                          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ================= VENTANA EMERGENTE ================= */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4" style={{ backgroundColor: '#2d3034', color: '#e8eaed' }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-white">
                  {editandoId ? "Editar Chofer" : "Registrar Nuevo Chofer"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label small fw-bold" style={{ color: '#9aa0a6' }}>Nombre y Apellido</label>
                    <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} className="form-control border-0" style={{ backgroundColor: '#1a1c1e', color: 'white' }} placeholder="Ej: Juan Pérez" />
                  </div>
                  
                  <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-bold" style={{ color: '#9aa0a6' }}>Carnet de Identidad</label>
                        <input type="text" name="ci" value={formData.ci} onChange={handleChange} className="form-control border-0" style={{ backgroundColor: '#1a1c1e', color: 'white' }} placeholder="Ej: 1234567" disabled={editandoId ? true : false} title={editandoId ? "El CI no se puede editar porque es el usuario" : ""} />
                        <small style={{ color: '#9aa0a6', fontSize: '0.7em' }}>Será el usuario de acceso</small>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-bold" style={{ color: '#9aa0a6' }}>Contraseña de Acceso</label>
                        <input type="text" name="password" value={formData.password} onChange={handleChange} className="form-control border-0" style={{ backgroundColor: '#1a1c1e', color: 'white' }} placeholder={editandoId ? "Dejar vacío para no cambiar" : "Ej: secreta123"} />
                      </div>
                  </div>

                  <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-bold" style={{ color: '#9aa0a6' }}>Número de Socio</label> 
                        <input type="text" name="nro_socio" value={formData.nro_socio} onChange={handleChange} className="form-control border-0" style={{ backgroundColor: '#1a1c1e', color: 'white' }} placeholder="Ej: 00125" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-bold" style={{ color: '#9aa0a6' }}>Número de Celular</label>
                        <input type="text" name="celular" value={formData.celular} onChange={handleChange} className="form-control border-0" style={{ backgroundColor: '#1a1c1e', color: 'white' }} placeholder="Ej: 77712345" />
                      </div>
                  </div>

                  <div className="mb-3">
                      <label className="form-label small fw-bold" style={{ color: '#9aa0a6' }}>Asignar a Grupo</label>
                      <select 
                          name="grupo" 
                          value={formData.grupo} 
                          onChange={handleChange} 
                          className="form-select border-0"
                          style={{ backgroundColor: '#1a1c1e', color: 'white' }}
                      >
                          <option value="" style={{ color: '#9aa0a6' }}>-- Seleccione un Grupo --</option>
                          {grupos.map(g => (
                              <option key={g.id} value={g.id}>{g.nombre}</option>
                          ))}
                      </select>
                  </div>

                </form>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn rounded-pill px-4 text-white" style={{ border: '1px solid #5f6368', backgroundColor: 'transparent' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button 
                  type="button" 
                  className="btn rounded-pill px-4" 
                  style={{ backgroundColor: '#669df6', color: '#1a1c1e', fontWeight: 'bold' }}
                  onClick={handleGuardar}>
                  {editandoId ? "Actualizar Chofer" : "Guardar Chofer"}
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