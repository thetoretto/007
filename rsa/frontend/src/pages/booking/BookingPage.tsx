import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Keep if needed for other navigation
import { AppNavbar } from '../../components/common/AppNavbar';
import BookingWidget from '../../components/booking/BookingWidget'; // Import the new widget
import { MapPin, CalendarCheck, Ticket, Info } from 'lucide-react'; // Import icons
import { promoMessages } from '../../utils/mockData'; // Import promoMessages
// import useAuthStore from '../../store/authStore'; // Keep if needed for user info outside widget
// import useBookingStore from '../../store/bookingStore'; // Store logic is now inside the widget

const BookingPage: React.FC = () => {
  // const { user } = useAuthStore(); // Get user if needed for other parts of the page
  // const navigate = useNavigate();
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // promoMessages moved to mockData.ts

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % promoMessages.length);
    }, 5000); // Change message every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [promoMessages.length]);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <MapPin className="h-8 w-8 mr-3 text-blue-600" /> {/* Icon added */} 
          Ready for Your Next Trip?
        </h1>
        <p className="text-lg text-gray-600 mb-8">Find and book your ride easily with our new booking system.</p>

        {/* Main Booking Section */}
        <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8"> {/* Added margin bottom */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center justify-center">
            <CalendarCheck className="h-6 w-6 mr-2 text-green-600" /> {/* Icon added */} 
            Start Your Booking
          </h2>
          <p className="text-gray-500 mb-6">Click the button below to launch the booking widget.</p>
          <button
            onClick={openBookingWidget}
            className="btn btn-primary btn-lg inline-flex items-center" // Added inline-flex and items-center
          >
            <Ticket className="h-5 w-5 mr-2" /> {/* Icon added */} 
            Book Now
          </button>
        </div>

        {/* Dynamic Promo Card (New Location & Style) */}
        <div className="p-6 bg-blue-600 rounded-lg shadow-md text-center text-white flex items-center justify-center">
          <Info className="h-6 w-6 mr-3 animate-pulse" /> {/* Icon added */} 
          <p className="text-xl font-n animate-pulse"> {/* Increased text size, changed font weight */} 
             {promoMessages[currentMessageIndex]} 
          </p>
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