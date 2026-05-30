import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import Sidebar from './Sidebar.jsx';

const getInitials = (name) => {
  if (!name) return 'S/N';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const Vehiculos = () => {
  const navigate = useNavigate();
  const { sidebarVisible, toggleSidebar, sindicatoName } = useUI();

  const [showModal, setShowModal] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [todosLosChoferes, setTodosLosChoferes] = useState([]);

  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    nro_motor: '',
    nro_licencia: '',
    chofer: ''
  });

  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  function cargarDatos() {
    fetch('http://127.0.0.1:8000/api/vehiculos/')
      .then(response => response.json())
      .then(data => setVehiculos(data))
      .catch(error => console.error("Error al cargar vehículos:", error));
    fetch('http://127.0.0.1:8000/api/choferes/')
      .then(response => response.json())
      .then(data => setTodosLosChoferes(data))
      .catch(error => console.error("Error al cargar choferes:", error));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const abrirModalCrear = () => {
    setFormData({ placa: '', modelo: '', nro_motor: '', nro_licencia: '', chofer: '' });
    setEditandoId(null);
    setShowModal(true);
  };

  const abrirModalEditar = (vehiculo) => {
    const choferId = vehiculo.chofer && typeof vehiculo.chofer === 'object' ? vehiculo.chofer.id : vehiculo.chofer;

    setFormData({
      placa: vehiculo.placa || '',
      modelo: vehiculo.modelo || '',
      nro_motor: vehiculo.nro_motor || '',
      nro_licencia: vehiculo.nro_licencia || '',
      chofer: choferId || ''
    });
    setEditandoId(vehiculo.id);
    setShowModal(true);
  };

  const handleGuardar = () => {
    const url = editandoId
      ? `http://127.0.0.1:8000/api/vehiculos/${editandoId}/`
      : 'http://127.0.0.1:8000/api/vehiculos/';

    const method = editandoId ? 'PUT' : 'POST';
    const datosAEnviar = {
      ...formData,
      chofer: formData.chofer ? parseInt(formData.chofer) : null
    };

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosAEnviar),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      return response.json();
    })
    .then(() => {
      cargarDatos();
      setShowModal(false);
    })
    .catch(error => {
        console.error("Error al guardar:", error);
    });
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este vehículo?")) {
      fetch(`http://127.0.0.1:8000/api/vehiculos/${id}/`, {
        method: 'DELETE',
      })
      .then(() => {
        cargarDatos();
      })
      .catch(error => console.error("Error al eliminar:", error));
    }
  };

  const obtenerChoferesDisponibles = () => {
    const idsOcupados = vehiculos
      .filter(v => v.chofer && v.id !== editandoId)
      .map(v => typeof v.chofer === 'object' ? v.chofer.id : v.chofer);
    return todosLosChoferes.filter(chofer => !idsOcupados.includes(chofer.id));
  };

  const vehiculosFiltrados = vehiculos.filter((vehiculo) => {
    const textoBuscado = busqueda.toLowerCase();
    const placa = vehiculo.placa ? vehiculo.placa.toLowerCase() : '';
    const modelo = vehiculo.modelo ? vehiculo.modelo.toLowerCase() : '';
    const nombreChofer = vehiculo.chofer && typeof vehiculo.chofer === 'object'
      ? vehiculo.chofer.nombre_completo.toLowerCase()
      : '';

    return placa.includes(textoBuscado) || modelo.includes(textoBuscado) || nombreChofer.includes(textoBuscado);
  });

  const mostrarNombreChofer = (choferData) => {
    if (!choferData) return <span style={{ color: '#888', fontSize: '0.9rem' }}>Sin asignar</span>;

    let nombre = "";
    if (typeof choferData === 'object') {
      nombre = choferData.nombre_completo;
    } else {
      const choferEncontrado = todosLosChoferes.find(c => c.id === choferData);
      nombre = choferEncontrado ? choferEncontrado.nombre_completo : `ID: ${choferData}`;
    }

    const initials = getInitials(nombre);

    return (
      <div className="d-flex align-items-center gap-2">
        <div className="rounded-circle bg-white text-dark d-flex justify-content-center align-items-center fw-bold flex-shrink-0"
             style={{ width: '28px', height: '28px', fontSize: '11px' }}>
          {initials}
        </div>
        <span style={{ color: '#58a6ff', fontSize: 'clamp(0.8rem, 2vw, 0.95rem)' }}>{nombre}</span>
      </div>
    );
  };

  return (
    <div className="app-shell d-flex" style={{ backgroundColor: '#1a1c1e', minHeight: '100vh', color: '#fff' }}>
      <Sidebar />

      <main className="app-main" style={{}}>
        {/* ENCABEZADO Y BUSCADOR */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-md-center mb-4 gap-3" style={{ padding: '1rem' }}>
          <h2 className="m-0 fw-bold text-white" style={{ fontSize: 'clamp(1.25rem, 5vw, 1.8rem)' }}>Gestión de vehículos</h2>
          <div className="d-flex flex-column flex-sm-row gap-2 gap-md-3 w-100 w-md-auto">
            <div className="position-relative flex-grow-1 flex-sm-grow-0" style={{ minWidth: '200px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#888" className="position-absolute top-50 translate-middle-y" style={{ left: '12px' }} viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
              <input
                type="text"
                className="form-control border-0 shadow-sm text-light w-100"
                placeholder="Buscar..."
                style={{ backgroundColor: '#2d3034', paddingLeft: '35px', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button
              className="btn text-nowrap d-flex align-items-center justify-content-center gap-2 flex-shrink-0"
              style={{ backgroundColor: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', whiteSpace: 'nowrap' }}
              onClick={abrirModalCrear}
            >
              + <span className="d-none d-sm-inline">Agregar vehículo</span><span className="d-sm-none">Agregar</span>
            </button>
          </div>
        </div>

        {/* VISTA TABLA EN DESKTOP, CARDS EN MÓVIL */}
        <div style={{ padding: '0 1rem' }}>
          {/* TABLA PARA DESKTOP */}
          <div className="d-none d-lg-block card shadow-sm border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#2d3034' }}>
            <div className="table-responsive">
              {/* === AQUÍ ESTÁ EL CAMBIO CLAVE: Agregamos table-dark y variables CSS para asegurar fondo transparente === */}
              <table className="table table-dark table-borderless mb-0 text-start align-middle" style={{ '--bs-table-bg': 'transparent', '--bs-table-color': '#fff' }}>
                <thead style={{ borderBottom: '1px solid #444' }}>
                  <tr>
                    <th className="py-3 px-4 fw-normal" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Chofer asignado</th>
                    <th className="py-3 px-3 fw-normal" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Placa</th>
                    <th className="py-3 px-3 fw-normal" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Modelo</th>
                    <th className="py-3 px-3 fw-normal d-none d-xl-table-cell" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Nº Motor</th>
                    <th className="py-3 px-3 fw-normal d-none d-xl-table-cell" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Licencia</th>
                    <th className="py-3 px-4 fw-normal text-end" style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiculosFiltrados.length === 0 ? (
                    <tr><td colSpan="6" className="py-4 text-center" style={{ color: '#9aa0a6', backgroundColor: 'transparent' }}>No se encontraron vehículos.</td></tr>
                  ) : (
                    vehiculosFiltrados.map((vehiculo) => (
                      <tr key={vehiculo.id} style={{ borderBottom: '1px solid #444', backgroundColor: 'transparent' }}>
                        <td className="py-3 px-4" style={{ backgroundColor: 'transparent' }}>{mostrarNombreChofer(vehiculo.chofer)}</td>
                        <td className="py-3 px-3 fw-bold text-white" style={{ backgroundColor: 'transparent' }}>{vehiculo.placa}</td>
                        <td className="py-3 px-3" style={{ color: '#e8eaed', backgroundColor: 'transparent' }}>{vehiculo.modelo}</td>
                        <td className="py-3 px-3 d-none d-xl-table-cell" style={{ color: '#e8eaed', backgroundColor: 'transparent' }}>{vehiculo.nro_motor || '-'}</td>
                        <td className="py-3 px-3 d-none d-xl-table-cell" style={{ color: '#e8eaed', backgroundColor: 'transparent' }}>{vehiculo.nro_licencia || '-'}</td>
                        <td className="py-3 px-4 text-end" style={{ backgroundColor: 'transparent' }}>
                          <button className="btn btn-sm me-2 border-0" style={{ background: 'none', color: '#f28b82', padding: '0.25rem' }} onClick={() => abrirModalEditar(vehiculo)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                            </svg>
                          </button>
                          <button className="btn btn-sm border-0" style={{ background: 'none', color: '#9aa0a6', padding: '0.25rem' }} onClick={() => handleEliminar(vehiculo.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
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

          {/* CARDS PARA MÓVIL */}
          <div className="d-lg-none">
            {vehiculosFiltrados.length === 0 ? (
              <div className="text-center py-4" style={{ color: '#9aa0a6' }}>No se encontraron vehículos.</div>
            ) : (
              <div className="row g-3">
                {vehiculosFiltrados.map((vehiculo) => (
                  <div key={vehiculo.id} className="col-12 col-sm-6">
                    <div className="card border-0 rounded-3 p-3 h-100" style={{ backgroundColor: '#2d3034' }}>
                      <div className="mb-3">
                        <span style={{ fontSize: '0.8rem', color: '#9aa0a6' }}>Chofer</span>
                        <div>{mostrarNombreChofer(vehiculo.chofer)}</div>
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <span style={{ fontSize: '0.8rem', color: '#9aa0a6' }}>Placa</span>
                          <div className="fw-bold text-white" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{vehiculo.placa}</div>
                        </div>
                        <div className="col-6">
                          <span style={{ fontSize: '0.8rem', color: '#9aa0a6' }}>Modelo</span>
                          <div style={{ color: '#e8eaed', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>{vehiculo.modelo}</div>
                        </div>
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <span style={{ fontSize: '0.8rem', color: '#9aa0a6' }}>Nº Motor</span>
                          <div style={{ color: '#e8eaed', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>{vehiculo.nro_motor || '-'}</div>
                        </div>
                        <div className="col-6">
                          <span style={{ fontSize: '0.8rem', color: '#9aa0a6' }}>Licencia</span>
                          <div style={{ color: '#e8eaed', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>{vehiculo.nro_licencia || '-'}</div>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button className="btn btn-sm flex-grow-1 border-0" style={{ background: 'none', color: '#f28b82', padding: '0.5rem' }} onClick={() => abrirModalEditar(vehiculo)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                          </svg>
                        </button>
                        <button className="btn btn-sm flex-grow-1 border-0" style={{ background: 'none', color: '#9aa0a6', padding: '0.5rem' }} onClick={() => handleEliminar(vehiculo.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4" style={{ backgroundColor: '#2d3034', color: '#fff' }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-white">
                    {editandoId ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Asignar Chofer</label>
                      <select
                        name="chofer"
                        value={formData.chofer}
                        onChange={handleChange}
                        className="form-select border-0 text-light"
                        style={{ backgroundColor: '#1a1c1e' }}
                      >
                        <option value="">-- Sin asignar --</option>
                        {obtenerChoferesDisponibles().map((chofer) => (
                          <option key={chofer.id} value={chofer.id}>
                            {chofer.nombre_completo}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Placa</label>
                      <input type="text" name="placa" value={formData.placa} onChange={handleChange} className="form-control border-0 text-light" style={{ backgroundColor: '#1a1c1e' }} placeholder="Ej: 1234ABC" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Modelo / Marca</label>
                      <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} className="form-control border-0 text-light" style={{ backgroundColor: '#1a1c1e' }} placeholder="Ej: Toyota Coaster" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Número de Motor (Opcional)</label>
                      <input type="text" name="nro_motor" value={formData.nro_motor} onChange={handleChange} className="form-control border-0 text-light" style={{ backgroundColor: '#1a1c1e' }} placeholder="Ej: 5L-1234567" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Licencia de Transporte (Opcional)</label>
                      <input type="text" name="nro_licencia" value={formData.nro_licencia} onChange={handleChange} className="form-control border-0 text-light" style={{ backgroundColor: '#1a1c1e' }} placeholder="Ej: L-98765" />
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn rounded-pill px-4 text-white" style={{ border: '1px solid #5f6368', backgroundColor: 'transparent' }} onClick={() => setShowModal(false)}>Cancelar</button>
                  <button
                    type="button"
                    className="btn rounded-pill px-4"
                    style={{ backgroundColor: '#669df6', color: '#1a1c1e', fontWeight: 'bold' }}
                    onClick={handleGuardar}
                  >
                    {editandoId ? "Actualizar" : "Guardar"}
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

export default Vehiculos;