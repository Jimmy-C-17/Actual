import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import Sidebar from './Sidebar.jsx';

// Componentes de iconos SVG internos para mantener el código limpio
const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

const IconBuilding = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line><line x1="12" y1="18" x2="12" y2="18"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="12" y1="10" x2="12" y2="10"></line><line x1="12" y1="6" x2="12" y2="6"></line><line x1="8" y1="18" x2="8" y2="18"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="8" y1="10" x2="8" y2="10"></line><line x1="8" y1="6" x2="8" y2="6"></line><line x1="16" y1="18" x2="16" y2="18"></line><line x1="16" y1="14" x2="16" y2="14"></line><line x1="16" y1="10" x2="16" y2="10"></line><line x1="16" y1="6" x2="16" y2="6"></line></svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const Configuracion = () => {
  const navigate = useNavigate();
  const { sidebarVisible, sindicatoName, telefonoSindicato: telefonoSindicatoContext, direccionSindicato: direccionSindicatoContext, setInstitutionData } = useUI();
  const [seccionActiva, setSeccionActiva] = useState('cuenta');
  const [admins, setAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [adminForm, setAdminForm] = useState({
    username: '', first_name: '', password: '', is_superuser: false
  });
  const [nombreSindicato, setNombreSindicato] = useState(sindicatoName);
  const [telefonoSindicato, setTelefonoSindicato] = useState(telefonoSindicatoContext || '+591 4 4123456');
  const [direccionSindicato, setDireccionSindicato] = useState(direccionSindicatoContext || 'Av. Capitán Víctor Ustáriz, Cochabamba');

  useEffect(() => {
    setNombreSindicato(sindicatoName);
    setTelefonoSindicato(telefonoSindicatoContext || '+591 4 4123456');
    setDireccionSindicato(direccionSindicatoContext || 'Av. Capitán Víctor Ustáriz, Cochabamba');
  }, [sindicatoName, telefonoSindicatoContext, direccionSindicatoContext]);

  useEffect(() => { cargarAdmins(); }, []);

  function cargarAdmins() {
    fetch('http://127.0.0.1:8000/api/admins/')
      .then(res => res.json())
      .then(data => setAdmins(Array.isArray(data) ? data : []))
      .catch(error => console.error('Error al cargar admins:', error));
  }

  const abrirNuevoAdmin = () => {
    setSelectedAdminId(null);
    setAdminForm({ username: '', first_name: '', password: '', is_superuser: false });
  };

  const seleccionarAdmin = (admin) => {
    setSelectedAdminId(admin.id);
    setAdminForm({
      username: admin.username || '',
      first_name: admin.first_name || '',
      password: '',
      is_superuser: !!admin.is_superuser
    });
  };

  const handleAdminChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdminForm({ ...adminForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleGuardarAdmin = () => {
    if (!adminForm.username.trim() || !adminForm.first_name.trim()) return;

    const url = selectedAdminId ? `http://127.0.0.1:8000/api/admins/${selectedAdminId}/` : 'http://127.0.0.1:8000/api/admins/';
    const method = selectedAdminId ? 'PUT' : 'POST';
    const payload = {
      username: adminForm.username.trim(),
      first_name: adminForm.first_name.trim(),
      is_staff: true,
      is_superuser: adminForm.is_superuser
    };
    if (adminForm.password.trim()) payload.password = adminForm.password.trim();

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => { cargarAdmins(); if (!selectedAdminId) abrirNuevoAdmin(); });
  };

  const handleEliminarAdmin = () => {
    if (!selectedAdminId) return;
    fetch(`http://127.0.0.1:8000/api/admins/${selectedAdminId}/`, { method: 'DELETE' })
      .then(() => { cargarAdmins(); abrirNuevoAdmin(); });
  };

  const handleActualizarSindicato = () => {
    if (!nombreSindicato.trim()) return;
    setInstitutionData({
      sindicatoName: nombreSindicato.trim(),
      telefonoSindicato: telefonoSindicato.trim(),
      direccionSindicato: direccionSindicato.trim()
    });
  };

  return (
    <div className="app-shell" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: '#fff' }}>
      <Sidebar />
      <main className="app-main p-4" style={{ marginLeft: sidebarVisible ? '240px' : '80px' }}>
        <h3 className="mb-4 fw-bold text-white">Configuración del sistema</h3>
        
        <div className="row g-4">
          <div className="col-lg-3">
            <div className="d-flex flex-column gap-2">
              <button 
                className={`btn text-start d-flex align-items-center gap-3 border-0 px-3 py-2 ${seccionActiva === 'cuenta' ? 'bg-white text-primary fw-bold rounded-3 shadow-sm' : 'text-light bg-transparent'}`}
                onClick={() => setSeccionActiva('cuenta')}
              >
                <IconLock /> Cuenta y seguridad
              </button>
              <button 
                className={`btn text-start d-flex align-items-center gap-3 border-0 px-3 py-2 ${seccionActiva === 'sindicato' ? 'bg-white text-primary fw-bold rounded-3 shadow-sm' : 'text-light bg-transparent'}`}
                onClick={() => setSeccionActiva('sindicato')}
              >
                <IconBuilding /> Datos del sindicato
              </button>
            </div>
          </div>

          <div className="col-lg-9">
            {seccionActiva === 'cuenta' && (
              <div className="card border-0 rounded-4 p-4" style={{ backgroundColor: '#242424', minHeight: '500px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold text-white mb-0">Administradores del sistema</h5>
                  <button className="btn btn-outline-secondary text-white btn-sm px-3 rounded-3 d-flex align-items-center gap-2" onClick={abrirNuevoAdmin} style={{ borderColor: '#4a4a4a' }}>
                    <IconPlus /> Nuevo administrador
                  </button>
                </div>

                <div className="row g-0">
                  <div className="col-lg-4 border-end" style={{ borderColor: '#333' }}>
                    <div className="pe-3">
                      <div className="fw-bold mb-3 pb-2 text-white border-bottom" style={{ borderColor: '#333' }}>Lista de administradores</div>
                      <div className="list-group list-group-flush gap-1">
                        {admins.map((admin) => (
                          <button
                            key={admin.id}
                            className={`list-group-item list-group-item-action border-0 rounded-2 py-2 px-3 ${selectedAdminId === admin.id ? 'bg-white text-primary fw-bold' : 'bg-transparent text-light'}`}
                            onClick={() => seleccionarAdmin(admin)}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{admin.username}</span>
                              {admin.is_superuser && <span className="badge bg-primary rounded-pill">Super</span>}
                            </div>
                            <small style={{ opacity: 0.7 }}>{admin.first_name || 'Sin nombre'}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-8">
                    <div className="ps-lg-4 mt-4 mt-lg-0">
                      <div className="fw-bold mb-3 pb-2 text-white border-bottom" style={{ borderColor: '#333' }}>
                        {selectedAdminId ? 'Editar administrador' : 'Nuevo administrador'}
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-white small">Nombre de usuario</label>
                        <input type="text" name="username" className="form-control border-0 text-white" style={{ backgroundColor: '#181818' }} value={adminForm.username} onChange={handleAdminChange} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-white small">Nombre completo</label>
                        <input type="text" name="first_name" className="form-control border-0 text-white" style={{ backgroundColor: '#181818' }} value={adminForm.first_name} onChange={handleAdminChange} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-white small">Contraseña</label>
                        <input type="password" name="password" className="form-control border-0 text-white" style={{ backgroundColor: '#181818' }} value={adminForm.password} onChange={handleAdminChange} placeholder={selectedAdminId ? 'Vacio para no cambiar' : 'Nueva contraseña'} />
                      </div>
                      <div className="form-check form-switch mb-4">
                        <input className="form-check-input" type="checkbox" name="is_superuser" checked={adminForm.is_superuser} onChange={handleAdminChange} />
                        <label className="form-check-label text-light small">Superusuario</label>
                      </div>
                      <div className="d-flex gap-2 flex-wrap mt-4">
                        <button className="btn text-white px-4 py-2 rounded-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#1a1a1a', border: '1px solid #4a4a4a' }} onClick={handleGuardarAdmin}>
                          <IconCheck /> Guardar administrador
                        </button>
                        {selectedAdminId && <button className="btn btn-outline-danger px-4" onClick={handleEliminarAdmin}>Eliminar</button>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {seccionActiva === 'sindicato' && (
              <div className="card border-0 rounded-4 p-4" style={{ backgroundColor: '#242424', minHeight: '500px' }}>
                <h5 className="fw-bold mb-4 text-white">Información de la Institución</h5>
                <div className="col-md-8">
                  <div className="mb-3">
                    <label className="form-label text-white small">Nombre Oficial</label>
                    <input type="text" className="form-control border-0 text-white" style={{ backgroundColor: '#181818' }} value={nombreSindicato} onChange={(e) => setNombreSindicato(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white small">Teléfono</label>
                    <input type="text" className="form-control border-0 text-white" style={{ backgroundColor: '#181818' }} value={telefonoSindicato} onChange={(e) => setTelefonoSindicato(e.target.value)} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-white small">Dirección</label>
                    <textarea className="form-control border-0 text-white" style={{ backgroundColor: '#181818' }} rows="3" value={direccionSindicato} onChange={(e) => setDireccionSindicato(e.target.value)}></textarea>
                  </div>
                  <button className="btn text-white px-4 py-2 rounded-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#1a1a1a', border: '1px solid #4a4a4a' }} onClick={handleActualizarSindicato}>
                    <IconCheck /> Actualizar Información
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Configuracion;