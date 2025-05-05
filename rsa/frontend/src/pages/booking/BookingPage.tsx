import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Keep if needed for other navigation
import { AppNavbar } from '../../components/common/AppNavbar';
import BookingWidget from '../../components/booking/BookingWidget'; // Import the new widget
// import useAuthStore from '../../store/authStore'; // Keep if needed for user info outside widget
// import useBookingStore from '../../store/bookingStore'; // Store logic is now inside the widget

const BookingPage: React.FC = () => {
  // const { user } = useAuthStore(); // Get user if needed for other parts of the page
  // const navigate = useNavigate();
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  const openBookingWidget = () => {
    setIsWidgetOpen(true);
  };

  const closeBookingWidget = () => {
    setIsWidgetOpen(false);
  };

  const handleBookingComplete = (bookingDetails: any) => {
    console.log('Booking Complete:', bookingDetails);
    // Optionally navigate or show a success message on the page
    closeBookingWidget();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AppNavbar />
      
      {/* Main page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Ready for Your Next Trip?</h1>
        <p className="text-lg text-gray-600 mb-8">Find and book your ride easily with our new booking system.</p>
        
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Start Your Booking</h2>
          <p className="text-gray-500 mb-6">Click the button below to launch the booking widget.</p>
          <button
            onClick={openBookingWidget}
            className="btn btn-primary btn-lg"
          >
            Book Now
          </button>
        </div>
        
        {/* Add other page content here if needed */}
        
      </div>

      {/* Render the Booking Widget as a modal */}
      {isWidgetOpen && (
        <BookingWidget 
          onComplete={handleBookingComplete} 
          onCancel={closeBookingWidget} 
        />
      )}
    </div>
  );
};

export default BookingPage;