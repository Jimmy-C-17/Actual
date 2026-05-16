import { useLocation, useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';

// Iconos SVG (Idénticos a tus capturas)
const IconHome = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconTruck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>;
const IconMapPin = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconLogout = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

const IconBrand = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#3b82f6"/>
    <path d="M10 11C10 9.89543 10.8954 9 12 9H20C21.1046 9 22 9.89543 22 11V19C22 20.1046 21.1046 21 20 21H12C10.8954 21 10 20.1046 10 19V11Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 23V21H14V23H12Z" fill="white"/>
    <path d="M18 23V21H20V23H18Z" fill="white"/>
    <circle cx="13.5" cy="18.5" r="1.5" fill="white"/>
    <circle cx="18.5" cy="18.5" r="1.5" fill="white"/>
    <path d="M10 14H22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const navItems = [
  { path: '/dashboard', label: 'Inicio', icon: <IconHome /> },
  { path: '/choferes', label: 'Choferes', icon: <IconUsers /> },
  { path: '/vehiculos', label: 'Vehículos', icon: <IconTruck /> },
  { path: '/rutas', label: 'Rutas', icon: <IconMapPin /> },
  { path: '/planificacion', label: 'Planificación', icon: <IconCalendar /> },
  { path: '/configuracion', label: 'Configuración', icon: <IconSettings /> }
];

const Sidebar = () => {
  const { sidebarVisible, sindicatoName, logout } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  // Variables de color para asegurar exactitud
  const colors = {
    bgMain: '#042749', // Azul oscuro del fondo
    bgActive: '#0b3b6a', // Azul más claro para el item seleccionado
    textMuted: '#8ca1b9', // Gris azulado para items inactivos
    textActive: '#ffffff', // Blanco para item activo
    accent: '#3b82f6', // Borde azul brillante
    border: '#11355a' // Líneas separadoras
  };

  return (
    <aside 
      style={{
        backgroundColor: colors.bgMain,
        width: sidebarVisible ? '240px' : '80px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        borderRight: '1px solid #000',
        zIndex: 1000
      }}
    >
      {/* BRANDING */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ minWidth: '32px', display: 'flex' }}>
          <IconBrand />
        </div>
        {sidebarVisible && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', lineHeight: '1.2' }}>
              {sindicatoName || 'Línea S'}
            </span>
            <span style={{ color: colors.textMuted, fontSize: '12px' }}>Admin</span>
          </div>
        )}
      </div>

      {/* NAVEGACIÓN */}
      <nav style={{ display: 'flex', flexDirection: 'column', marginTop: '16px', flex: 1, padding: '0' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 20px',
                backgroundColor: isActive ? colors.bgActive : 'transparent',
                color: isActive ? colors.textActive : colors.textMuted,
                border: 'none',
                borderLeft: isActive ? `4px solid ${colors.accent}` : '4px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background-color 0.2s ease',
                fontWeight: isActive ? '600' : '500',
                fontSize: '15px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = colors.textMuted;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              {sidebarVisible && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* BOTÓN CERRAR SESIÓN */}
      <div style={{ padding: '20px', borderTop: `1px solid ${colors.border}` }}>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarVisible ? 'flex-start' : 'center',
            gap: '12px',
            width: '100%',
            padding: '10px',
            backgroundColor: 'transparent',
            color: colors.textActive,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{ display: 'flex' }}><IconLogout /></div>
          {sidebarVisible && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;