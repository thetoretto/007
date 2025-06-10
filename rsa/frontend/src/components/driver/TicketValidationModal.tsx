import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import '../../index.css';

interface TicketValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidateTicket: (ticketId: string) => Promise<{ success: boolean; message: string }>;
}

const TicketValidationModal: React.FC<TicketValidationModalProps> = ({ isOpen, onClose, onValidateTicket }) => {
  const [ticketId, setTicketId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleValidation = async () => {
    if (!ticketId.trim()) {
      setValidationResult({ success: false, message: 'Please enter a ticket ID or scan QR.' });
      return;
    }
    setIsLoading(true);
    setValidationResult(null);
    try {
      const result = await onValidateTicket(ticketId);
      setValidationResult(result);
      if (result.success) {
        // setTicketId(''); // Option to clear on success
      }
    } catch (error) {
      setValidationResult({ success: false, message: 'An unexpected error occurred. Please try again.' });
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setTicketId('');
    setValidationResult(null);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
        // onClick={handleClose} // Removed to prevent closing when clicking overlay if that's desired, or keep if not.
    >
      <div
        className="card w-full max-w-md transform transition-all duration-300 ease-out scale-100 opacity-100"
        // onClick={(e) => e.stopPropagation()} // Keep if overlay click should not close.
      >
        <div className="p-4 border-b border-light dark:border-dark flex justify-between items-center">
            <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">Validate Ticket</h3>
            <button onClick={handleClose} className="btn btn-sm btn-ghost text-light-tertiary dark:text-dark-tertiary hover:bg-light dark:hover:bg-dark" aria-label="Close modal">
              <X size={20} />
            </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
            <p className="text-sm text-light-secondary dark:text-dark-secondary">
              Enter the passenger's ticket ID below or use the QR code scanner.
            </p>

            <div>
              <label htmlFor="ticketIdInputModal" className="form-label flex items-center">
                <Search size={14} className="mr-1.5 text-light-tertiary dark:text-dark-tertiary" /> Ticket ID
              </label>
              <input
                type="text"
                id="ticketIdInputModal"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="E.g., TICKET123XYZ"
                className="form-input w-full"
                disabled={isLoading}
              />
            </div>

            {/* QR Scanner Button Placeholder - requires a QR library */}
            {/*
            <div className="divider text-xs text-light-tertiary dark:text-dark-tertiary">OR</div>
            <button className="btn btn-outline btn-primary w-full flex items-center gap-2" disabled={isLoading}>
                <Search size={20} /> Scan QR Code
            </button>
            */}

            {validationResult && (
              <div className={`alert shadow-md text-sm mt-4 ${validationResult.success ? 'alert-success' : 'alert-error'}`}>
                {validationResult.success ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                <span>{validationResult.message}</span>
              </div>
            )}
        </div>

        <div className="p-4 border-t border-light dark:border-dark flex justify-end space-x-3">
            <button 
              onClick={handleClose} 
              className="btn btn-ghost" 
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              onClick={handleValidation} 
              className="btn btn-primary flex items-center gap-2 min-w-[120px]"
              disabled={isLoading || !ticketId.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Validating...
                </>
              ) : 'Validate'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TicketValidationModal; 