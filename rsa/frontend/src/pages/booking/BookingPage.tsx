import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Keep if needed for other navigation
import Navbar from '../../components/common/Navbar';
import BookingWidget from '../../components/booking/BookingWidget'; // Import the new widget
import { MapPin, CalendarCheck, Ticket, Info } from 'lucide-react'; // Import icons
import { promoMessages } from '../../utils/mockData'; // Import promoMessages
import '../../index.css';

// import useAuthStore from '../../store/authStore'; // Keep if needed for user info outside widget
// import useBookingStore from '../../store/bookingStore'; // Store logic is now inside the widget

const BookingPage: React.FC = () => {
  // const { user } = useAuthStore(); // Get user if needed for other parts of the page
  // const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  

  // promoMessages moved to mockData.ts

  useEffect(() => {
    const fullMessage = promoMessages[currentMessageIndex];
    let charIndex = 0;
  
    const typeInterval = setInterval(() => {
      setDisplayedText(fullMessage.slice(0, charIndex + 1));
      charIndex++;
      if (charIndex === fullMessage.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % promoMessages.length);
          setDisplayedText('');
        }, 2000); // Delay before switching message
      }
    }, 70); // Typing speed (ms per character)
  
    return () => clearInterval(typeInterval);
  }, [currentMessageIndex]);
  

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
    <div className="min-h-screen ">
      <Navbar />
      
      {/* Main page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-accent mb-6 flex items-center">
          <MapPin className="h-8 w-8 mr-3 text-blue-600" /> 
          Ready for Your Next Trip?
        </h1>
        <p className="text-lg text-base mb-8">Find and book your ride easily with our new booking system.</p>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 max-w-5xl mx-auto">
          <div className="lg:col-span-1 p-10 bg-gradient-to-br from-primary-900 to-primary-700 rounded-xl shadow-2xl text-white flex flex-col justify-between min-h-[400px]">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Info className="h-8 w-8 mr-2" />
           
              </div>
              <p className="text-lg text-primary-100 leading-relaxed font-mono whitespace-pre-wrap text-center">
                {displayedText}
                <span className="inline-block w-1.5 h-6 bg-primary-100 animate-pulse ml-1.5" />
              </p>
            </div>
          </div>

          <div className="lg:col-span-1 bg-[#AEFFDE] p-12 rounded-xl shadow-2xl flex flex-col items-center justify-center min-h-[400px] transform transition-all hover:scale-[1.02] group">
            <div className="mb-8 text-center space-y-6">
              <CalendarCheck className="h-16 w-16 text-gray-900 mx-auto mb-6 animate-bounce" />
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                Instant Booking
              </h2>
              <p className="text-xl text-gray-800 max-w-md">
                Secure your seat in just 3 simple steps
              </p>
            </div>
            <div className="space-y-8 w-full">
              <div className="flex justify-center space-x-5">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="bg-gray-800 p-5 rounded-full shadow-lg w-14 h-14 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{num}</span>
                  </div>
                ))}
              </div>
              <p className="text-lg text-gray-700 italic text-center">
                "Fastest booking in the region"
              </p>
            </div>
            <button
              onClick={openBookingWidget}
              className="mt-8 bg-black hover:bg-blue-700 text-white font-semibold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center"
            >
              <Ticket className="h-7 w-7 mr-3" />
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