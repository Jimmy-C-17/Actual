import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import Sidebar from './Sidebar.jsx';

const Configuracion = () => {
  const navigate = useNavigate();
  const { sidebarVisible, toggleSidebar, sindicatoName, telefonoSindicato: telefonoSindicatoContext, direccionSindicato: direccionSindicatoContext, setInstitutionData } = useUI();
  const [seccionActiva, setSeccionActiva] = useState('cuenta');
  const [admins, setAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [adminForm, setAdminForm] = useState({
    username: '',
    first_name: '',
    password: '',
    is_superuser: false
  });
  const [nombreSindicato, setNombreSindicato] = useState(sindicatoName);
  const [telefonoSindicato, setTelefonoSindicato] = useState(telefonoSindicatoContext || '+591 4 4123456');
  const [direccionSindicato, setDireccionSindicato] = useState(direccionSindicatoContext || 'Av. Capitán Víctor Ustáriz, Cochabamba');

  useEffect(() => {
    setNombreSindicato(sindicatoName);
    setTelefonoSindicato(telefonoSindicatoContext || '+591 4 4123456');
    setDireccionSindicato(direccionSindicatoContext || 'Av. Capitán Víctor Ustáriz, Cochabamba');
  }, [sindicatoName, telefonoSindicatoContext, direccionSindicatoContext]);

  useEffect(() => {
    cargarAdmins();
  }, []);

  function cargarAdmins() {
    fetch('http://127.0.0.1:8000/api/admins/')
      .then(res => res.json())
      .then(data => setAdmins(Array.isArray(data) ? data : []))
      .catch(error => {
        console.error('Error al cargar admins:', error);
        setAdmins([]);
      });
  };

  const abrirNuevoAdmin = () => {
    setSelectedAdminId(null);
    setAdminForm({ username: '', first_name: '', password: '', is_superuser: false });
    setSeccionActiva('cuenta');
  };

  const seleccionarAdmin = (admin) => {
    setSelectedAdminId(admin.id);
    setAdminForm({
      username: admin.username || '',
      first_name: admin.first_name || '',
      password: '',
      is_superuser: !!admin.is_superuser
    });
    setSeccionActiva('cuenta');
  };

  const handleAdminChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdminForm({
      ...adminForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleGuardarAdmin = () => {
    if (!adminForm.username.trim() || !adminForm.first_name.trim()) {
      return showToast('El nombre de usuario y el nombre completo son obligatorios.');
    }

    const url = selectedAdminId
      ? `http://127.0.0.1:8000/api/admins/${selectedAdminId}/`
      : 'http://127.0.0.1:8000/api/admins/';

    const method = selectedAdminId ? 'PUT' : 'POST';
    const payload = {
      username: adminForm.username.trim(),
      first_name: adminForm.first_name.trim(),
      is_staff: true,
      is_superuser: adminForm.is_superuser
    };

    if (adminForm.password.trim()) {
      payload.password = adminForm.password.trim();
    }

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async response => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Error al guardar el administrador.');
        }
        return response.json();
      })
      .then(() => {
        cargarAdmins();
        showToast(selectedAdminId ? 'Administrador actualizado.' : 'Administrador creado.');
        if (!selectedAdminId) abrirNuevoAdmin();
      })
      .catch(error => {
        console.error('Error al guardar admin:', error);
        showToast('No se pudo guardar el administrador. Revisa la consola para más detalles.');
      });
  };

  const handleEliminarAdmin = () => {
    if (!selectedAdminId) return showToast('Selecciona un administrador para eliminar.');
    if (!window.confirm('¿Seguro que deseas eliminar este administrador?')) return;

    fetch(`http://127.0.0.1:8000/api/admins/${selectedAdminId}/`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) throw new Error('Error al eliminar el administrador.');
        cargarAdmins();
        abrirNuevoAdmin();
        showToast('Administrador eliminado.');
      })
      .catch(error => {
        console.error('Error al eliminar admin:', error);
        showToast('No se pudo eliminar el administrador. Revisa la consola para más detalles.');
      });
  };

  const handleActualizarSindicato = () => {
    if (!nombreSindicato.trim()) {
      return showToast('El nombre del sindicato no puede quedar vacío.');
    }
    setInstitutionData({
      sindicatoName: nombreSindicato.trim(),
      telefonoSindicato: telefonoSindicato.trim(),
      direccionSindicato: direccionSindicato.trim()
    });
    showToast('Información del sindicato actualizada correctamente.');
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <h2 className="mb-4 fw-bold text-secondary">Configuración del Sistema</h2>
        <div className="row g-4">
          {/* Menú de Configuración (Sub-sidebar) */}
          <div className="col-lg-3">
            <div className="card shadow-sm border-0 rounded-4 p-3 bg-white">
              <div className="nav flex-column gap-2">
                <button 
                  className={`btn text-start ${seccionActiva === 'cuenta' ? 'btn-primary fw-bold' : 'btn-light'}`}
                  onClick={() => setSeccionActiva('cuenta')}
                >
                  🔐 Cuenta y Seguridad
                </button>
                <button 
                  className={`btn text-start ${seccionActiva === 'sindicato' ? 'btn-primary fw-bold' : 'btn-light'}`}
                  onClick={() => setSeccionActiva('sindicato')}
                >
                  🏢 Datos del Sindicato
                </button>
              </div>
            </div>
          </div>

          {/* Área de Formularios según la pestaña activa */}
          <div className="col-lg-9">
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white" style={{ minHeight: '400px' }}>
              
              {/* VISTA 1: CUENTA */}
              {seccionActiva === 'cuenta' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="fw-bold text-secondary">Administradores del Sistema</h5>
                      <p className="text-muted small mb-0">Crea, edita o elimina cuentas de administrador.</p>
                    </div>
                    <button className="btn btn-outline-primary btn-sm" onClick={abrirNuevoAdmin}>+ Nuevo administrador</button>
                  </div>

                  <div className="row g-4">
                    <div className="col-lg-5">
                      <div className="card shadow-sm border-0 rounded-4 p-3 bg-light" style={{ minHeight: '320px' }}>
                        <div className="fw-bold mb-3 text-secondary">Lista de administradores</div>
                        <div className="list-group">
                          {admins.length === 0 ? (
                            <div className="text-muted small p-3">No existen administradores guardados.</div>
                          ) : (
                            admins.map((admin) => (
                              <button
                                type="button"
                                key={admin.id}
                                className={`list-group-item list-group-item-action ${selectedAdminId === admin.id ? 'active' : ''}`}
                                onClick={() => seleccionarAdmin(admin)}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <span>{admin.username}</span>
                                  <span className="badge bg-primary">{admin.is_superuser ? 'Super' : 'Staff'}</span>
                                </div>
                                <small className="text-muted">{admin.first_name || 'Sin nombre'}</small>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-7">
                      <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                        <div className="mb-3">
                          <label className="form-label fw-bold text-muted small">Nombre de Usuario</label>
                          <input
                            type="text"
                            name="username"
                            className="form-control bg-light border-0"
                            value={adminForm.username}
                            onChange={handleAdminChange}
                            placeholder="Ej: admin01"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold text-muted small">Nombre Completo</label>
                          <input
                            type="text"
                            name="first_name"
                            className="form-control bg-light border-0"
                            value={adminForm.first_name}
                            onChange={handleAdminChange}
                            placeholder="Ej: Juan Pérez"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold text-muted small">Contraseña</label>
                          <input
                            type="password"
                            name="password"
                            className="form-control bg-light border-0"
                            value={adminForm.password}
                            onChange={handleAdminChange}
                            placeholder={selectedAdminId ? 'Dejar vacío para no cambiar' : 'Nueva contraseña'}
                          />
                        </div>
                        <div className="form-check form-switch mb-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="adminSuperUser"
                            name="is_superuser"
                            checked={adminForm.is_superuser}
                            onChange={handleAdminChange}
                          />
                          <label className="form-check-label text-muted" htmlFor="adminSuperUser">
                            Superusuario (acceso completo)
                          </label>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                          <button className="btn btn-success fw-bold" onClick={handleGuardarAdmin}>
                            Guardar Administrador
                          </button>
                          {selectedAdminId && (
                            <button className="btn btn-danger fw-bold" onClick={handleEliminarAdmin}>
                              Eliminar Administrador
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VISTA 2: SINDICATO */}
              {seccionActiva === 'sindicato' && (
                <div>
                  <h5 className="fw-bold mb-4 text-secondary">Información de la Institución</h5>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-muted small">Nombre Oficial</label>
                    <input type="text" className="form-control bg-light border-0" value={nombreSindicato} onChange={(e) => setNombreSindicato(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-muted small">Teléfono de Contacto</label>
                    <input type="text" className="form-control bg-light border-0" value={telefonoSindicato} onChange={(e) => setTelefonoSindicato(e.target.value)} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold text-muted small">Dirección Principal</label>
                    <textarea className="form-control bg-light border-0" rows="2" value={direccionSindicato} onChange={(e) => setDireccionSindicato(e.target.value)}></textarea>
                  </div>
                  <button className="btn btn-success fw-bold shadow-sm" onClick={handleActualizarSindicato}>
                    Actualizar Información del Sindicato
                  </button>
                </div>
              )}


            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Configuracion;