import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * A custom hook for managing toast notifications
 * 
 * @returns {ToastContextType} Toast management functions and state
 */
export const useToast = (): ToastContextType => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add a new toast notification
  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, message, type, duration };
      
      setToasts((prevToasts) => [...prevToasts, newToast]);
      
      // Auto-remove toast after duration
      if (duration !== Infinity) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      
      return id;
    },
    []
  );

  // Remove a specific toast by ID
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return { toasts, addToast, removeToast, clearToasts };
};