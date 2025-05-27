import React from 'react';
import Toast from './Toast';
import { useToast, Toast as ToastType } from '../../hooks/useToast';

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  toasts?: ToastType[];
  removeToast?: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  toasts: externalToasts,
  removeToast: externalRemoveToast
}) => {
  // Use either provided toasts or get from context
  const toastContext = useToast();
  const toasts = externalToasts || toastContext.toasts;
  const removeToast = externalRemoveToast || toastContext.removeToast;
  
  if (toasts.length === 0) return null;
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };
  
  return (
    <div 
      className={`fixed z-50 flex flex-col gap-2 ${positionClasses[position]}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onClose={removeToast} 
        />
      ))}
    </div>
  );
};

export default ToastContainer;