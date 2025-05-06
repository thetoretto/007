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
          <MapPin className="h-8 w-8 mr-3 text-blue-600" /> 
          Ready for Your Next Trip?
        </h1>
        <p className="text-lg text-gray-600 mb-8">Find and book your ride easily with our new booking system.</p>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"> {/* Changed to grid, 3 columns on lg */}
                    {/* Dynamic Promo Card - Spans 1 column on lg */}
                    <div className="lg:col-span-1 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-xl text-white flex flex-col justify-between min-h-[250px]"> {/* Gradient, increased shadow, min-height, justify-between */}
            <div> {/* Container for top content */}
              <div className="flex items-center mb-3"> {/* Align icon and title */}
                <Info className="h-6 w-6 mr-2 flex-shrink-0" /> 
                <h3 className="text-xl font-semibold">Don't Miss Out!</h3>
              </div>
              <p className="text-sm text-blue-100 animate-pulse leading-relaxed"> {/* Adjusted text color, leading */}
                {promoMessages[currentMessageIndex]} 
              </p>
            </div>
            <a 
              href="/offers" // Example link, adjust as needed
              className="mt-4 text-sm text-blue-200 hover:text-white font-medium self-start underline transition-colors duration-300" // CTA for promo
            >
              View All Offers &rarr;
            </a>
          </div>
          {/* Main Booking Section - Spans 2 columns on lg */}
          <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-xl flex flex-col items-center justify-center min-h-[250px]"> {/* Increased shadow, min-height */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <CalendarCheck className="h-7 w-7 mr-2 text-green-600" /> 
              Start Your Booking
            </h2>
            <p className="text-gray-600 mb-6 text-center max-w-md"> {/* Adjusted text color, max-width */}
              Click the button below to launch our intuitive booking widget and secure your ride in minutes.
            </p>
            <button
              onClick={openBookingWidget}
              className="btn btn-primary btn-lg inline-flex items-center shadow-md hover:shadow-lg transition-shadow duration-300" // Added shadow effects
            >
              <Ticket className="h-5 w-5 mr-2" /> 
              Book Now
            </button>
          </div>


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