import React, { useRef, useEffect } from 'react';
import { X, Check, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ConfirmationType = 'success' | 'warning' | 'error' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  hideCancel?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  hideCancel = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <Check className="h-6 w-6 text-secondary" />,
          bgColor: 'bg-secondary/10',
          borderColor: 'border-secondary',
          confirmBgColor: 'bg-secondary hover:bg-secondary-dark text-white'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-primary" />,
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary',
          confirmBgColor: 'bg-primary hover:bg-primary-dark text-black'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-6 w-6 text-accent" />,
          bgColor: 'bg-accent/10',
          borderColor: 'border-accent',
          confirmBgColor: 'bg-accent hover:bg-accent-dark text-white'
        };
      default:
        return {
          icon: <Info className="h-6 w-6 text-purple" />,
          bgColor: 'bg-purple/10',
          borderColor: 'border-purple',
          confirmBgColor: 'bg-purple hover:bg-purple-dark text-black'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className={`w-full max-w-md card shadow-2xl ${typeStyles.bgColor} border-l-4 ${typeStyles.borderColor} overflow-hidden transform transition-all`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-text-light-tertiary dark:text-text-dark-tertiary hover:text-text-light-primary dark:hover:text-text-dark-primary transition-colors duration-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">{typeStyles.icon}</div>
            <div>
              <h3 className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary" id="modal-headline">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">{message}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            {!hideCancel && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary w-full sm:w-auto"
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg shadow-sm text-sm font-medium ${typeStyles.confirmBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 