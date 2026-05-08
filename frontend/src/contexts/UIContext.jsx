import { createContext, useContext, useEffect, useState } from 'react';

const UIContext = createContext(null);
const getLocalStorageBoolean = (key, defaultValue) => {
  const stored = window.localStorage.getItem(key);
  if (stored === null) return defaultValue;
  return stored === 'true';
};
const getLocalStorageJSON = (key, defaultValue) => {
  const stored = window.localStorage.getItem(key);
  if (stored === null) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
};
function UIProvider({ children }) {
  const [sidebarVisible, setSidebarVisible] = useState(() => getLocalStorageBoolean('sidebarVisible', true));
  const [sindicatoName, setSindicatoName] = useState(() => window.localStorage.getItem('sindicatoName') || 'Sindicato 15 de Abril');
  const [userName, setUserName] = useState(() => window.localStorage.getItem('userName') || '');
  const [rol, setRol] = useState(() => window.localStorage.getItem('rol') || '');
  const [choferId, setChoferId] = useState(() => getLocalStorageJSON('choferId', null));
  const [grupo, setGrupo] = useState(() => window.localStorage.getItem('grupo') || '');
  const [isConnected, setIsConnected] = useState(() => getLocalStorageBoolean('isConnected', false));
  const [telefonoSindicato, setTelefonoSindicato] = useState(() => window.localStorage.getItem('telefonoSindicato') || '+591 4 4123456');
  const [direccionSindicato, setDireccionSindicato] = useState(() => window.localStorage.getItem('direccionSindicato') || 'Av. Capitán Víctor Ustáriz, Cochabamba');

  useEffect(() => {
    window.localStorage.setItem('sidebarVisible', sidebarVisible);
  }, [sidebarVisible]);

  useEffect(() => {
    window.localStorage.setItem('sindicatoName', sindicatoName);
  }, [sindicatoName]);

  useEffect(() => {
    window.localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
    window.localStorage.setItem('rol', rol);
  }, [rol]);

  useEffect(() => {
    window.localStorage.setItem('choferId', JSON.stringify(choferId));
  }, [choferId]);

  useEffect(() => {
    window.localStorage.setItem('grupo', grupo);
  }, [grupo]);

  useEffect(() => {
    window.localStorage.setItem('isConnected', isConnected);
  }, [isConnected]);

  useEffect(() => {
    window.localStorage.setItem('telefonoSindicato', telefonoSindicato);
  }, [telefonoSindicato]);

  useEffect(() => {
    window.localStorage.setItem('direccionSindicato', direccionSindicato);
  }, [direccionSindicato]);

  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showToast = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => removeToast(id), 4200);
  };

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const setUserData = ({ userName, rol, choferId = null, grupo = '', isConnected = false }) => {
    setUserName(userName);
    setRol(rol);
    setChoferId(choferId);
    setGrupo(grupo);
    setIsConnected(isConnected);
  };

  const setInstitutionData = ({ sindicatoName, telefonoSindicato, direccionSindicato }) => {
    if (sindicatoName !== undefined) setSindicatoName(sindicatoName);
    if (telefonoSindicato !== undefined) setTelefonoSindicato(telefonoSindicato);
    if (direccionSindicato !== undefined) setDireccionSindicato(direccionSindicato);
  };

  const logout = () => {
    setUserName('');
    setRol('');
    setChoferId(null);
    setGrupo('');
    setIsConnected(false);
  };

  return (
    <UIContext.Provider
      value={{
        sidebarVisible,
        toggleSidebar,
        sindicatoName,
        setSindicatoName,
        telefonoSindicato,
        direccionSindicato,
        setInstitutionData,
        userName,
        rol,
        choferId,
        grupo,
        isConnected,
        setUserData,
        logout,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used inside UIProvider');
  }
  return context;
}

export default UIProvider;
