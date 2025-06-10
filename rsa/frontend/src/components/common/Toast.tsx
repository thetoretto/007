import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'react-feather';
import { Toast as ToastType } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  
  // Handle automatic closing
  useEffect(() => {
    if (toast.duration && toast.duration !== Infinity) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        // Add a small delay before actually removing to allow exit animation
        setTimeout(() => onClose(toast.id), 300);
      }, toast.duration - 300); // Subtract animation time
      
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);
  
  // Handle manual close
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 300);
  };
  
  // Determine icon and colors based on toast type
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          bgColor: 'bg-secondary/10 dark:bg-secondary/20',
          textColor: 'text-light-primary dark:text-dark-primary',
          borderColor: 'border-secondary',
          iconColor: 'text-secondary'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bgColor: 'bg-accent/10 dark:bg-accent/20',
          textColor: 'text-light-primary dark:text-dark-primary',
          borderColor: 'border-accent',
          iconColor: 'text-accent'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          bgColor: 'bg-primary/10 dark:bg-primary/20',
          textColor: 'text-light-primary dark:text-dark-primary',
          borderColor: 'border-primary',
          iconColor: 'text-primary'
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          bgColor: 'bg-purple/10 dark:bg-purple/20',
          textColor: 'text-light-primary dark:text-dark-primary',
          borderColor: 'border-purple',
          iconColor: 'text-purple'
        };
    }
  };
  
  const styles = getToastStyles();
  
  return (
    <div
      className={`card flex items-center w-full max-w-xs p-4 mb-4 border-l-4 ${styles.bgColor} ${styles.borderColor} ${isExiting ? 'animate-fade-out' : 'animate-slide-in'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`icon-badge icon-badge-sm ${styles.iconColor} mr-3`}>
        {styles.icon}
      </div>
      <div className={`flex-1 text-sm font-normal ${styles.textColor}`}>
        {toast.message}
      </div>
      <button
        type="button"
        className={`ml-3 p-1.5 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors duration-300 ${styles.iconColor}`}
        aria-label="Close"
        onClick={handleClose}
      >
        <span className="sr-only">Close</span>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;