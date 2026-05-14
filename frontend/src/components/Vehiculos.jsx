import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import Sidebar from './Sidebar.jsx';

const Vehiculos = () => {
  const navigate = useNavigate();
  const { sidebarVisible, toggleSidebar, sindicatoName } = useUI();
  
  const [showModal, setShowModal] = useState(false);
  const [vehiculos, setVehiculos] = useState([]); 
  const [todosLosChoferes, setTodosLosChoferes] = useState([]); // Nuevo estado para los choferes
  
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
      showToast(editandoId ? "¡Vehículo actualizado!" : "¡Vehículo guardado con éxito!");
    })
    .catch(error => {
        console.error("Error al guardar:", error);
        showToast("Hubo un error al guardar. Revisa la consola para más detalles.");
    });
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este vehículo?")) {
      fetch(`http://127.0.0.1:8000/api/vehiculos/${id}/`, {
        method: 'DELETE',
      })
      .then(() => {
        cargarDatos(); 
        showToast("Vehículo eliminado.");
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
    if (typeof choferData === 'object') return choferData.nombre_completo;
    const choferEncontrado = todosLosChoferes.find(c => c.id === choferData);
    return choferEncontrado ? choferEncontrado.nombre_completo : `ID: ${choferData}`;
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="m-0 fw-bold text-secondary">Gestión de Vehículos</h2>
          <div className="d-flex gap-3">
            <input 
              type="text" 
              className="form-control shadow-sm border-0" 
              placeholder="Buscar por placa, modelo o chofer..." 
              style={{ minWidth: '300px' }} 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button 
              className="btn btn-dark shadow-sm text-nowrap" 
              style={{ backgroundColor: '#6c757d', border: 'none' }}
              onClick={abrirModalCrear}
            >
              + Agregar nuevo vehículo
            </button>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <table className="table table-hover mb-0 text-center align-middle">
            <thead className="table-secondary">
              <tr>
                <th className="py-3">Chofer Asignado</th>
                <th className="py-3">Placa</th>
                <th className="py-3">Modelo / Marca</th>
                <th className="py-3">Número de Motor</th>
                <th className="py-3">Licencia</th>
                <th className="py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-muted">No se encontraron vehículos.</td>
                </tr>
              ) : (
                vehiculosFiltrados.map((vehiculo) => (
                  <tr key={vehiculo.id}>
                    <td className="fw-bold text-primary">{mostrarNombreChofer(vehiculo.chofer)}</td>
                    <td className="fw-bold">{vehiculo.placa}</td>
                    <td>{vehiculo.modelo}</td>
                    <td>{vehiculo.nro_motor || <span className="text-muted fst-italic">N/A</span>}</td>
                    <td>{vehiculo.nro_licencia || <span className="text-muted fst-italic">N/A</span>}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-2 border-0"
                        onClick={() => abrirModalEditar(vehiculo)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger border-0"
                        onClick={() => handleEliminar(vehiculo.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {/* ================= VENTANA EMERGENTE (MODAL) ================= */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-secondary">
                  {editandoId ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  
                  {/* SELECT PARA ASIGNAR CHOFER */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Asignar Chofer</label>
                    <select 
                      name="chofer" 
                      value={formData.chofer} 
                      onChange={handleChange} 
                      className="form-select bg-light border-0"
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
                    <label className="form-label small fw-bold text-muted">Placa</label>
                    <input type="text" name="placa" value={formData.placa} onChange={handleChange} className="form-control bg-light border-0" placeholder="Ej: 1234ABC" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Modelo / Marca</label>
                    <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} className="form-control bg-light border-0" placeholder="Ej: Toyota Coaster" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Número de Motor (Opcional)</label>
                    <input type="text" name="nro_motor" value={formData.nro_motor} onChange={handleChange} className="form-control bg-light border-0" placeholder="Ej: 5L-1234567" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Licencia de Transporte (Opcional)</label>
                    <input type="text" name="nro_licencia" value={formData.nro_licencia} onChange={handleChange} className="form-control bg-light border-0" placeholder="Ej: L-98765" />
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancelar</button>
                <button 
                  type="button" 
                  className="btn btn-success px-4" 
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