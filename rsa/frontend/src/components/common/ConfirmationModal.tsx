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
          icon: <Check className="h-6 w-6 text-success dark:text-success" />,
          bgColor: 'bg-success bg-opacity-10 dark:bg-success dark:bg-opacity-20',
          borderColor: 'border-success',
          confirmBgColor: 'bg-success hover:bg-success-darker text-accent-black dark:text-accent-black'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-warning dark:text-accent-yellow" />,
          bgColor: 'bg-warning bg-opacity-10 dark:bg-warning dark:bg-opacity-20',
          borderColor: 'border-warning',
          confirmBgColor: 'bg-warning hover:bg-warning-darker text-accent-black dark:text-accent-black'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-6 w-6 text-error dark:text-error" />,
          bgColor: 'bg-error bg-opacity-10 dark:bg-error dark:bg-opacity-20',
          borderColor: 'border-error',
          confirmBgColor: 'bg-error hover:bg-error-darker text-text-inverse'
        };
      default:
        return {
          icon: <Info className="h-6 w-6 text-primary dark:text-primary-200" />,
          bgColor: 'bg-primary-100 dark:bg-primary-900 dark:bg-opacity-30',
          borderColor: 'border-primary dark:border-primary-200',
          confirmBgColor: 'bg-primary hover:bg-primary-600 text-text-inverse dark:bg-primary-400 dark:hover:bg-primary-300 dark:text-text-base'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent-black bg-opacity-50 dark:bg-opacity-70">
      <div
        ref={modalRef}
        className={`w-full max-w-md rounded-lg shadow-xl ${typeStyles.bgColor} border-l-4 ${typeStyles.borderColor} overflow-hidden transform transition-all bg-background-light dark:bg-section-dark`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-text-muted hover:text-primary dark:text-primary-200 dark:hover:text-primary-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">{typeStyles.icon}</div>
            <div>
              <h3 className="text-lg font-medium text-text-base dark:text-text-inverse" id="modal-headline">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-text-base dark:text-text-inverse">{message}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            {!hideCancel && (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 border border-primary-100 dark:border-primary-800 rounded-md shadow-sm text-sm font-medium text-text-base dark:text-text-inverse bg-background-light dark:bg-section-dark hover:bg-section-light dark:hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-200 dark:focus:ring-offset-background-dark"
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
              className={`w-full sm:w-auto px-4 py-2 rounded-md shadow-sm text-sm font-medium ${typeStyles.confirmBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-200 dark:focus:ring-offset-background-dark`}
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