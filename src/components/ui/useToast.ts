import { useContext } from 'react';
import { ToastContext } from './toastContext';
import type { ToastContextValue } from './toastContext';

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return value;
}
