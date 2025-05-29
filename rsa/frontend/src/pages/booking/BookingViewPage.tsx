import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import BookingConfirmation from '../../components/common/BookingConfirmation';
import type { BookingDetails } from '../../components/common/BookingConfirmation';

const BookingViewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse booking details from URL parameters
    const searchParams = new URLSearchParams(location.search);
    
    try {
      // Collect all parameters to create a booking details object
      const id = searchParams.get('id');
      
      if (!id) {
        throw new Error('Booking ID is missing');
      }
      
      // Extract booking details from URL params
      const details: BookingDetails = {
        id,
        confirmationCode: searchParams.get('code') || undefined,
        fromLocation: searchParams.get('from') || 'Unknown origin',
        toLocation: searchParams.get('to') || 'Unknown destination',
        date: searchParams.get('date') || 'Unknown date',
        time: searchParams.get('time') || 'Unknown time',
        passengerName: searchParams.get('passenger') || 'Unknown passenger',
        seatNumber: searchParams.get('seat') || 'Unknown',
        seatType: searchParams.get('seatType') || 'Standard',
        paymentMethod: searchParams.get('payment') || 'Card',
        totalAmount: parseFloat(searchParams.get('amount') || '0'),
        pickupPoint: searchParams.get('pickup') || undefined
      };
      
      // In a real app, we would verify this booking with the server
      // Simulating API call
      setTimeout(() => {
        setBookingDetails(details);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Could not load booking details. Invalid or missing information.');
      setIsLoading(false);
    }
  }, [location.search]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* App-like header with back/home button */}
      <div className="bg-gradient-to-r from-accent-kente-gold-dark to-accent-kente-gold text-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center">
          <button 
            onClick={handleGoBack}
            className="mr-3 p-2 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold">Booking Details</h1>
          <div className="flex-1"></div>
          <button 
            onClick={handleGoHome}
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Go home"
          >
            <Home className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-4 py-4 sm:py-8 flex flex-col flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 flex-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-accent-kente-gold border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Loading booking details...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 text-center flex-1 flex flex-col items-center justify-center max-h-[80vh]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-2">Error Loading Booking</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-5 sm:mb-6 text-sm sm:text-base">{error}</p>
              <button
                onClick={handleGoHome}
                className="px-5 py-2 sm:px-6 sm:py-2.5 bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                Go to Homepage
              </button>
            </div>
          ) : bookingDetails ? (
            <div className="flex-1 overflow-auto max-h-[calc(100vh-120px)]">
              <BookingConfirmation 
                bookingDetails={bookingDetails}
                onBookAnother={handleGoHome}
                onViewBookings={() => navigate('/dashboard')}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BookingViewPage; 