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
          bgColor: 'bg-green-100 dark:bg-green-800/30',
          textColor: 'text-green-800 dark:text-green-200',
          borderColor: 'border-green-500 dark:border-green-600',
          iconColor: 'text-green-500 dark:text-green-400'
        };
      case 'error':
        return {
          icon: <X className="h-5 w-5" />,
          bgColor: 'bg-red-100 dark:bg-red-800/30',
          textColor: 'text-red-800 dark:text-red-200',
          borderColor: 'border-red-500 dark:border-red-600',
          iconColor: 'text-red-500 dark:text-red-400'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          bgColor: 'bg-yellow-100 dark:bg-yellow-800/30',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          borderColor: 'border-yellow-500 dark:border-yellow-600',
          iconColor: 'text-yellow-500 dark:text-yellow-400'
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          bgColor: 'bg-blue-100 dark:bg-blue-800/30',
          textColor: 'text-blue-800 dark:text-blue-200',
          borderColor: 'border-blue-500 dark:border-blue-600',
          iconColor: 'text-blue-500 dark:text-blue-400'
        };
    }
  };
  
  const styles = getToastStyles();
  
  return (
    <div 
      className={`flex items-center w-full max-w-xs p-4 mb-4 rounded-lg shadow border-l-4 ${styles.bgColor} ${styles.borderColor} ${isExiting ? 'animate-fade-out' : 'animate-slide-in'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${styles.iconColor}`}>
        {styles.icon}
      </div>
      <div className={`ml-3 text-sm font-normal ${styles.textColor}`}>
        {toast.message}
      </div>
      <button 
        type="button" 
        className={`ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 ${styles.textColor} hover:bg-gray-200 dark:hover:bg-gray-700`}
        aria-label="Close"
        onClick={handleClose}
      >
        <span className="sr-only">Close</span>
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;