// d:\007\rsa\frontend\src\pages\DriverCheckInPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import '../../index.css';

const DriverCheckInPage: React.FC = () => {
  const [bookingId, setBookingId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { checkInBooking } = useBookingStore();

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim()) {
      setMessage('Please enter a booking ID.');
      return;
    }
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call or store action
      console.log(`Attempting to check in booking ID: ${bookingId}`);
      const result = await checkInBooking(bookingId);

      if (result.success) {
        setMessage(result.message || 'Ticket validated successfully!');
        setBookingId(''); // Clear input after successful check-in
        // Optionally navigate or show more details
      } else {
        setMessage(result.message || 'Failed to validate ticket. Please try again.');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage('An error occurred during check-in. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="driver-dashboard min-h-screen flex flex-col items-center justify-center p-4">
      <div className="driver-modal max-w-lg w-full">
        {/* Header */}
        <div className="driver-modal-header">
          <div className="flex items-center gap-3">
            <div className="icon-badge icon-badge-lg bg-primary text-on-primary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="driver-modal-title">Driver Check-In</div>
              <p className="text-sm text-light-secondary dark:text-dark-secondary">
                Validate passenger tickets
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="driver-modal-body">
          <form onSubmit={handleCheckIn} className="space-y-6">
            <div className="driver-form-section">
              <div className="driver-form-title">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4" />
                </svg>
                Ticket Validation
              </div>

              <div className="relative">
                <label htmlFor="bookingId" className="form-label">
                  Booking ID or QR Code
                </label>
                <input
                  type="text"
                  id="bookingId"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Enter booking ID (e.g., BK12345XYZ)"
                  className="form-input w-full pl-10"
                  required
                />
                <svg className="absolute left-3 top-10 h-4 w-4 text-light-tertiary dark:text-dark-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center gap-2 shadow-primary"
            >
              {isLoading ? (
                <>
                  <div className="driver-loading-spinner w-5 h-5"></div>
                  Validating Ticket...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Validate Ticket
                </>
              )}
            </button>
          </form>

          {message && (
            <div className={`driver-notification mt-6 ${message.includes('success') ? 'success' : 'urgent'}`}>
              <div className="flex items-start gap-3">
                <div className={`icon-badge icon-badge-sm ${message.includes('success') ? 'bg-secondary-light text-secondary' : 'bg-accent-light text-accent'} mt-0.5`}>
                  {message.includes('success') ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-medium text-light-primary dark:text-dark-primary mb-1">
                    {message.includes('success') ? 'Validation Successful' : 'Validation Failed'}
                  </div>
                  <div className="text-sm text-light-secondary dark:text-dark-secondary">
                    {message}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="driver-modal-footer">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverCheckInPage;