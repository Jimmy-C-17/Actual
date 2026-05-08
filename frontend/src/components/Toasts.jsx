import { useUI } from '../contexts/UIContext.jsx';

const toastColors = {
  info: '#2563eb',
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626'
};

const toastIcons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌'
};

const Toasts = () => {
  const { toasts, removeToast } = useUI();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}> 
          <div className="toast-content">
            <span className="toast-icon">{toastIcons[toast.type] || 'ℹ️'}</span>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)} title="Cerrar notificación">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toasts;
