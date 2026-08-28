import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * ToastProvider — replicates LP.toast (2600ms, top-right stack) with Bootstrap 5 Toast.
 * Provides useToast() returning a toast() function.
 */
const ToastContext = createContext(null);

let _id = 0;
const nextId = () => `toast-${++_id}`;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, title = 'Lazy Pygmy') => {
    const id = nextId();
    setToasts((cur) => [...cur, { id, message, title }]);
  }, []);

  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), 2600));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 2000 }}>
        {toasts.map((t) => (
          <div key={t.id} className="toast show" role="status" aria-live="polite">
            <div className="toast-header">
              <strong className="me-auto">{t.title}</strong>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => dismiss(t.id)}
              ></button>
            </div>
            <div className="toast-body">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const fn = useContext(ToastContext);
  if (!fn) throw new Error('useToast must be used within <ToastProvider>');
  return fn;
}
