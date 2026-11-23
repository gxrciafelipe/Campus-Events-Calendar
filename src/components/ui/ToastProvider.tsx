import type { ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Toast } from './Toast';
import { ToastContext } from './toastContext';
import type { ToastContextValue } from './toastContext';

type ToastItem = { id: number; message: string };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const showError = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showError }), [showError]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* The live region is always mounted so screen readers announce what is added to it. */}
      <div
        role="alert"
        className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md flex-col gap-2 pb-[env(safe-area-inset-bottom)]"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
