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
    <div 
      className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      style={{ 
        // Fondo azul oscuro similar a la imagen
        background: 'radial-gradient(circle at center, #155bb5 0%, #0a3d7a 100%)',
      }}
    >
      <div 
        className="card shadow-lg p-4" 
        style={{ 
          maxWidth: '420px', 
          width: '100%', 
          borderRadius: '20px',
          backgroundColor: '#2b2b2b', // Color oscuro de la tarjeta
          border: 'none',
          color: '#ffffff'
        }}
      >
        <div className="card-body text-center p-2">
          
          {/* --- ÍCONO DEL BUS (LOGO) --- */}
          <div className="d-flex justify-content-center mb-3">
            <div 
              style={{
                backgroundColor: '#1976d2',
                borderRadius: '16px',
                padding: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 14v4c0 .6.4 1 1 1h2"></path>
                <circle cx="7" cy="17" r="2"></circle>
                <path d="M9 17h6"></path>
                <circle cx="17" cy="17" r="2"></circle>
              </svg>
            </div>
          </div>

          {/* --- TÍTULO Y SUBTÍTULO --- */}
          <h3 className="fw-bold mb-1 text-white">{sindicatoName}</h3>
          <div className="mb-4" style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>
            <span>{telefonoSindicato} • {direccionSindicato}</span>
          </div>
          
          {/* --- ALERTA DE ERROR --- */}
          {error && <div className="alert alert-danger py-2 small" style={{ borderRadius: '10px' }}>{error}</div>}
          
          {/* --- FORMULARIO --- */}
          <form onSubmit={handleLogin}>
            
            {/* Campo de Usuario */}
            <div className="mb-3 text-start">
              <label className="form-label small fw-bold" style={{ color: '#d0d0d0' }}>Correo o usuario</label>
              <div className="position-relative">
                {/* Ícono de Usuario */}
                <span className="position-absolute" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <input 
                  type="text" 
                  name="username"
                  value={credenciales.username}
                  onChange={handleChange}
                  className="form-control form-control-lg shadow-none" 
                  placeholder="Ej: admin"
                  required
                  style={{ 
                    backgroundColor: '#1e1e1e', 
                    border: '1px solid #444', 
                    color: 'white',
                    paddingLeft: '45px',
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div className="mb-4 text-start">
              <label className="form-label small fw-bold" style={{ color: '#d0d0d0' }}>Contraseña</label>
              <div className="position-relative">
                {/* Ícono de Candado */}
                <span className="position-absolute" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input 
                  type="password" 
                  name="password"
                  value={credenciales.password}
                  onChange={handleChange}
                  className="form-control form-control-lg shadow-none" 
                  placeholder="••••••••"
                  required
                  style={{ 
                    backgroundColor: '#1e1e1e', 
                    border: '1px solid #444', 
                    color: 'white',
                    paddingLeft: '45px',
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            {/* Botón Principal */}
            <button 
              type="submit"
              className="btn w-100 mb-2 py-2 d-flex justify-content-center align-items-center gap-2 transition" 
              style={{ 
                backgroundColor: 'transparent', 
                border: '1px solid #666', 
                color: 'white', 
                borderRadius: '12px',
                fontWeight: '500',
                fontSize: '1rem'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#3d3d3d'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
              Iniciar sesión
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;