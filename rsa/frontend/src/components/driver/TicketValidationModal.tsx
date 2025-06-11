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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="driver-modal animate-scale-in">
        <div className="driver-modal-header">
          <div className="flex items-center gap-3">
            <div className="icon-badge icon-badge-md bg-primary-light text-primary">
              <Search className="h-5 w-5" />
            </div>
            <div className="driver-modal-title">Validate Ticket</div>
          </div>
          <button onClick={handleClose} className="btn btn-ghost btn-sm p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="driver-modal-body">
          <p className="text-light-secondary dark:text-dark-secondary mb-6">
            Enter the passenger's ticket ID below or use the QR code scanner to validate their booking.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="ticketIdInputModal" className="form-label">
                Ticket ID or QR Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="ticketIdInputModal"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter ticket ID (e.g., TICKET123XYZ)"
                  className="form-input w-full pl-10"
                  disabled={isLoading}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-tertiary dark:text-dark-tertiary" />
              </div>
            </div>

            {validationResult && (
              <div className={`driver-notification ${validationResult.success ? 'success' : 'urgent'}`}>
                <div className="flex items-start gap-3">
                  <div className={`icon-badge icon-badge-sm ${validationResult.success ? 'bg-secondary-light text-secondary' : 'bg-accent-light text-accent'} mt-0.5`}>
                    {validationResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="font-medium text-light-primary dark:text-dark-primary mb-1">
                      {validationResult.success ? 'Validation Successful' : 'Validation Failed'}
                    </div>
                    <div className="text-sm text-light-secondary dark:text-dark-secondary">
                      {validationResult.message}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="driver-modal-footer">
          <button
            onClick={handleClose}
            className="btn btn-ghost"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleValidation}
            className="btn btn-primary flex items-center gap-2 min-w-[140px] shadow-primary"
            disabled={isLoading || !ticketId.trim()}
          >
            {isLoading ? (
              <>
                <div className="driver-loading-spinner w-4 h-4"></div>
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Validate Ticket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketValidationModal; 