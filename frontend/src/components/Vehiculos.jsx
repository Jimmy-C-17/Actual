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
      if(typeof showToast === 'function') showToast(editandoId ? "¡Vehículo actualizado!" : "¡Vehículo guardado con éxito!");
    })
    .catch(error => {
        console.error("Error al guardar:", error);
        if(typeof showToast === 'function') showToast("Hubo un error al guardar. Revisa la consola para más detalles.");
    });
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este vehículo?")) {
      fetch(`http://127.0.0.1:8000/api/vehiculos/${id}/`, {
        method: 'DELETE',
      })
      .then(() => {
        cargarDatos(); 
        if(typeof showToast === 'function') showToast("Vehículo eliminado.");
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
    if (!choferData) return <span className="text-muted fst-italic">Sin asignar</span>;
    
    let nombre = "";
    if (typeof choferData === 'object') {
      nombre = choferData.nombre_completo;
    } else {
      const choferEncontrado = todosLosChoferes.find(c => c.id === choferData);
      nombre = choferEncontrado ? choferEncontrado.nombre_completo : `ID: ${choferData}`;
    }

    const initials = getInitials(nombre);

    return (
      <div className="d-flex flex-column align-items-center justify-content-center">
        <div className="rounded-circle bg-white text-dark d-flex justify-content-center align-items-center mb-1 fw-bold shadow-sm" 
             style={{ width: '32px', height: '32px', fontSize: '12px' }}>
          {initials}
        </div>
        <span style={{ color: '#58a6ff', fontSize: '14px', whiteSpace: 'nowrap' }}>{nombre}</span>
      </div>
    );
  };

  return (
    <div className="app-shell" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: '#fff' }}>
      <Sidebar />

      <main className="app-main p-4" style={{ marginLeft: sidebarVisible ? '240px' : '80px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="m-0 fw-bold text-white">Gestión de vehículos</h2>
          <div className="d-flex gap-3 align-items-center">
            <div className="position-relative">
              {/* Icono de búsqueda */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#888" className="position-absolute top-50 translate-middle-y" style={{ left: '12px' }} viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
              <input 
                type="text" 
                className="form-control border-0 shadow-sm text-light" 
                placeholder="Buscar por placa, modelo..." 
                style={{ minWidth: '300px', backgroundColor: '#2a2a2a', paddingLeft: '35px' }} 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button 
              className="btn text-nowrap d-flex align-items-center gap-2" 
              style={{ backgroundColor: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '8px' }}
              onClick={abrirModalCrear}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
              </svg>
              Agregar vehículo
            </button>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#242424' }}>
          <table className="table table-dark table-hover mb-0 text-center align-middle" style={{ backgroundColor: 'transparent', '--bs-table-bg': 'transparent' }}>
            <thead style={{ borderBottom: '1px solid #333' }}>
              <tr>
                <th className="py-3 text-secondary fw-normal">Chofer asignado</th>
                <th className="py-3 text-secondary fw-normal">Placa</th>
                <th className="py-3 text-secondary fw-normal">Modelo / Marca</th>
                <th className="py-3 text-secondary fw-normal">Nº de motor</th>
                <th className="py-3 text-secondary fw-normal">Licencia</th>
                <th className="py-3 text-secondary fw-normal">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-muted">No se encontraron vehículos.</td>
                </tr>
              ) : (
                vehiculosFiltrados.map((vehiculo) => (
                  <tr key={vehiculo.id} style={{ borderBottom: '1px solid #333' }}>
                    <td className="py-3">{mostrarNombreChofer(vehiculo.chofer)}</td>
                    <td className="fw-bold text-white">{vehiculo.placa}</td>
                    <td className="text-light">{vehiculo.modelo}</td>
                    <td className="text-light">{vehiculo.nro_motor || <span className="text-muted fst-italic">N/A</span>}</td>
                    <td className="text-light">{vehiculo.nro_licencia || <span className="text-muted fst-italic">N/A</span>}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        {/* Botón Editar con SVG */}
                        <button 
                          className="btn btn-sm d-flex justify-content-center align-items-center transition"
                          style={{ width: '36px', height: '36px', border: '1px solid #555', backgroundColor: 'transparent', color: '#bbb', borderRadius: '8px' }}
                          onClick={() => abrirModalEditar(vehiculo)}
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                          </svg>
                        </button>
                        {/* Botón Eliminar con SVG */}
                        <button 
                          className="btn btn-sm d-flex justify-content-center align-items-center transition"
                          style={{ width: '36px', height: '36px', border: '1px solid #dc3545', backgroundColor: 'transparent', color: '#dc3545', borderRadius: '8px' }}
                          onClick={() => handleEliminar(vehiculo.id)}
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {/* ================= VENTANA EMERGENTE (MODAL) ================= */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4" style={{ backgroundColor: '#2b2b2b', color: '#fff' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-white">
                  {editandoId ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  {/* SELECT PARA ASIGNAR CHOFER */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Asignar Chofer</label>
                    <select 
                      name="chofer" 
                      value={formData.chofer} 
                      onChange={handleChange} 
                      className="form-select border-0 text-light"
                      style={{ backgroundColor: '#1a1a1a' }}
                    >
                      <option value="">-- Sin asignar --</option>
                      {obtenerChoferesDisponibles().map((chofer) => (
                        <option key={chofer.id} value={chofer.id}>
                          {chofer.nombre_completo} (CI: {chofer.ci})
                        </option>
                      ))}
                    </select>
                    <div className="form-text small text-muted">Solo se muestran choferes sin vehículo asignado.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Placa</label>
                    <input type="text" name="placa" value={formData.placa} onChange={handleChange} className="form-control border-0 text-light" style={{ backgroundColor: '#1a1a1a' }} placeholder="Ej: 1234ABC" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Modelo / Marca</label>
                    <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} className="form-control border-0 text-light" style={{ backgroundColor: '#1a1a1a' }} placeholder="Ej: Toyota Coaster" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Número de Motor (Opcional)</label>
                    <input type="text" name="nro_motor" value={formData.nro_motor} onChange={handleChange} className="form-control border-0 text-light" style={{ backgroundColor: '#1a1a1a' }} placeholder="Ej: 5L-1234567" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Licencia de Transporte (Opcional)</label>
                    <input type="text" name="nro_licencia" value={formData.nro_licencia} onChange={handleChange} className="form-control border-0 text-light" style={{ backgroundColor: '#1a1a1a' }} placeholder="Ej: L-98765" />
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn" style={{ color: '#bbb' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button 
                  type="button" 
                  className="btn btn-primary px-4 rounded-pill" 
                  style={{ backgroundColor: '#0d6efd', border: 'none' }}
                  onClick={handleGuardar}
                >
                  {editandoId ? "Actualizar Vehículo" : "Guardar Vehículo"}
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