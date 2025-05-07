// d:\007\rsa\frontend\src\pages\DriverCheckInPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/bookingStore';
import '../index.css';

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 md:p-12 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Driver Check-In</h1>
        
        <form onSubmit={handleCheckIn} className="space-y-6">
          <div>
            <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Booking ID or Scan Ticket
            </label>
            <input
              type="text"
              id="bookingId"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="e.g., BK12345XYZ"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 transition duration-150 ease-in-out"
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
          <p className={`mt-6 text-center text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate(-1)} 
            className="text-sm text-primary-600 hover:text-primary-500 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverCheckInPage;