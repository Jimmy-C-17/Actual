import { useLocation, useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';

const navItems = [
  { path: '/dashboard', label: 'Inicio', icon: '🏠' },
  { path: '/choferes', label: 'Choferes', icon: '👨‍✈️' },
  { path: '/vehiculos', label: 'Vehículos', icon: '🚗' },
  { path: '/rutas', label: 'Rutas', icon: '📍' },
  { path: '/planificacion', label: 'Planificación', icon: '📅' },
  { path: '/configuracion', label: 'Configuración', icon: '⚙️' }
];

const Sidebar = () => {
  const { sidebarVisible, toggleSidebar, sindicatoName, logout } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className={`app-sidebar ${sidebarVisible ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">🚍</span>
          {sidebarVisible && <span>{sindicatoName || 'Sindicato'}</span>}
        </div>
      </div>

      <nav className="nav-list" aria-label="Navegación principal">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-logout"
          onClick={() => {
            logout();
            navigate('/');
          }}
          title="Cerrar sesión"
        >
          <span className="nav-icon">🚪</span>
          {sidebarVisible && <span className="nav-label">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
