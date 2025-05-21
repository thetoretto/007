import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Camera } from 'lucide-react';
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
      setValidationResult({ success: false, message: 'Please enter a ticket ID.' });
      return;
    }
    setIsLoading(true);
    setValidationResult(null); // Clear previous result before new validation
    try {
      const result = await onValidateTicket(ticketId);
      setValidationResult(result);
      if (result.success) {
        // Optionally clear ticketId or keep it for review
        // setTicketId(''); 
      }
    } catch (error) {
      setValidationResult({ success: false, message: 'An unexpected error occurred during validation.' });
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out" onClick={handleClose}>
      <div 
        className="card bg-background dark:bg-background-dark w-full max-w-lg shadow-xl transform transition-all duration-300 ease-in-out scale-100 opacity-100" 
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <div className="card-body p-0">
          <div className="flex justify-between items-center p-4 border-b border-border dark:border-border-dark">
            <h3 className="card-title text-lg">Validate Ticket / QR Code</h3>
            <button onClick={handleClose} className="btn btn-sm btn-ghost btn-circle">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
              Enter the ticket ID or scan the QR code to validate a passenger's ticket.
            </p>
            
            <div>
              <label htmlFor="ticketIdInput" className="label-text mb-1">
                Ticket ID
              </label>
              <input 
                type="text" 
                id="ticketIdInput" // Changed id to avoid conflict if multiple modals exist
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="E.g., TICKET123XYZ"
                className="input input-bordered w-full"
                disabled={isLoading}
              />
            </div>

            {/* Placeholder for QR Scanner Button - Future enhancement */}
            {/* <div className="text-center">
              <button className="btn btn-outline btn-primary w-full">
                <Camera className="h-5 w-5 mr-2" /> Scan QR Code
              </button>
            </div> */}

            {validationResult && (
              <div className={`alert ${validationResult.success ? 'alert-success' : 'alert-error'}`}>
                {validationResult.success ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                <span className="text-sm">{validationResult.message}</span>
              </div>
            )}
          </div>

          <div className="card-actions justify-end p-4 border-t border-border dark:border-border-dark">
            <button 
              onClick={handleClose} 
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              onClick={handleValidation} 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs mr-2"></span>
                  Validating...
                </>
              ) : 'Validate Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketValidationModal; 