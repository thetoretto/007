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
    <div className="min-h-screen bg-light dark:bg-dark flex flex-col items-center justify-center p-4">
      <div className="card p-8 md:p-12 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-light-primary dark:text-dark-primary mb-8">Driver Check-In</h1>
        
        <form onSubmit={handleCheckIn} className="space-y-6">
          <div>
            <label htmlFor="bookingId" className="form-label">
              Enter Booking ID or Scan Ticket
            </label>
            <input
              type="text"
              id="bookingId"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="e.g., BK12345XYZ"
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Validate Ticket'}
          </button>
        </form>

        {message && (
          <p className={`mt-6 text-center text-sm ${message.includes('success') ? 'text-secondary' : 'text-accent'}`}>
            {message}
          </p>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-primary hover:text-primary-dark hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverCheckInPage;