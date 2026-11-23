import { createContext } from 'react';

export type ToastContextValue = {
  /** Toasts are for failures outside the current view only. Success is shown by the UI changing. */
  showError: (message: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
