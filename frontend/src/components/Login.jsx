import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { sindicatoName, telefonoSindicato, direccionSindicato, setUserData } = useUI();
  const [credenciales, setCredenciales] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const handleChange = (e) => {
    setCredenciales({
      ...credenciales,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    fetch('http://127.0.0.1:8000/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credenciales),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'ok') {
          if (data.rol === 'admin') {
            setUserData({
              userName: data.nombre || credenciales.username,
              rol: 'admin',
              choferId: null,
              grupo: '',
              isConnected: true,
            });
            navigate('/dashboard');
          } else if (data.rol === 'chofer') {
            setUserData({
              userName: data.nombre || credenciales.username,
              rol: 'chofer',
              choferId: data.chofer_id,
              grupo: data.grupo || '',
              isConnected: true,
            });
            navigate('/vistachofer');
          }
        } else {
          setError(data.message);
        }
      })
      .catch((fetchError) => {
        console.error('Error en login:', fetchError);
        setError('Error de conexión con el servidor');
      });
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
        <div className="card-body text-center">
          {/* Título basado en tu diseño */}
          <h2 className="fw-bold mb-4 text-secondary">{sindicatoName}</h2>
          <div className="mb-3 text-muted small">
            <p className="mb-1">{telefonoSindicato}</p>
            <p className="mb-0">{direccionSindicato}</p>
          </div>
          
          {/* --- ALERTA ROJA SI HAY ERROR DE CONTRASEÑA --- */}
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          
          {/* --- CONECTAMOS EL FORMULARIO A handleLogin --- */}
          <form onSubmit={handleLogin}>
            
            {/* Campo de Usuario */}
            <div className="mb-3 text-start">
              <label className="form-label small fw-bold text-muted">Correo u Usuario</label>
              <input 
                type="text" 
                name="username"
                value={credenciales.username}
                onChange={handleChange}
                className="form-control form-control-lg bg-light border-0" 
                placeholder="Ej: admin"
                style={{ fontSize: '0.9rem' }}
                required
              />
            </div>

            {/* Campo de Contraseña */}
            <div className="mb-4 text-start">
              <label className="form-label small fw-bold text-muted">Contraseña</label>
              <input 
                type="password" 
                name="password"
                value={credenciales.password}
                onChange={handleChange}
                className="form-control form-control-lg bg-light border-0" 
                placeholder="••••••••"
                style={{ fontSize: '0.9rem' }}
                required
              />
            </div>

            {/* Botón Principal */}
            <button 
              type="submit"
              className="btn btn-dark btn-lg w-100 mb-3 shadow-sm" 
              style={{ backgroundColor: '#6c757d', border: 'none', fontWeight: '600' }}
            >
              INICIAR SESIÓN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;