import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import BookingWidget from '../../components/booking/BookingWidget';
import { MapPin, ChevronRight, Clock, Shield, CalendarCheck, Navigation } from 'lucide-react';
import '../../index.css';

const BookingPage: React.FC = () => {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Popular destinations data
  const popularOrigins = ['Accra', 'Lagos', 'Nairobi', 'Cape Town', 'Johannesburg'];
  const popularDestinations = ['Kumasi', 'Port Harcourt', 'Mombasa', 'Durban', 'Pretoria'];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openBookingWidget = () => {
    setIsWidgetOpen(true);
  };

  const closeBookingWidget = () => {
    setIsWidgetOpen(false);
  };

  const handleBookingComplete = (bookingDetails: any) => {
    console.log('Booking Complete:', bookingDetails);
    closeBookingWidget();
  };

  // Direct booking with origin/destination
  const handleDirectBooking = () => {
    if (origin && destination) {
      setIsWidgetOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Simple Header */}
      <div className="bg-gradient-to-r from-accent-kente-gold-dark to-accent-kente-gold text-black">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Book Your African Journey</h1>
        </div>
      </div>
      
      {/* Main Booking Form */}
      <div className="max-w-xl mx-auto px-4 -mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-100 dark:border-gray-700">
          <div className="space-y-4">
            {/* Origin Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Where from?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-accent-red"></div>
                </div>
                <input
                  type="text"
                  placeholder="Enter your starting point"
                  className="block w-full pl-8 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-accent-kente-gold focus:border-accent-kente-gold bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
                <button 
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-accent-kente-gold"
                  onClick={() => navigator.geolocation?.getCurrentPosition(
                    () => setOrigin("Current Location")
                  )}
                >
                  <MapPin className="h-5 w-5" />
                </button>
              </div>
              
              {/* Popular Origins */}
              <div className="mt-2 flex flex-wrap gap-2">
                {popularOrigins.map((city, i) => (
                  <button 
                    key={i} 
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-accent-kente-gold/20 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300"
                    onClick={() => setOrigin(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Destination Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Where to?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-accent-kente-gold"></div>
                </div>
                <input
                  type="text"
                  placeholder="Enter your destination"
                  className="block w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-accent-kente-gold focus:border-accent-kente-gold bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              
              {/* Popular Destinations */}
              <div className="mt-2 flex flex-wrap gap-2">
                {popularDestinations.map((city, i) => (
                  <button 
                    key={i} 
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-accent-kente-gold/20 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300"
                    onClick={() => setDestination(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Find Rides Button */}
            <button
              onClick={handleDirectBooking}
              disabled={!origin || !destination}
              className={`w-full rounded-lg py-4 px-4 text-center text-white font-bold text-lg flex items-center justify-center mt-4 transition-all
                ${(origin && destination) 
                  ? 'bg-accent-kente-gold hover:bg-accent-kente-gold-dark active:transform active:scale-95 cursor-pointer shadow-md' 
                  : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
            >
              Find Rides <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Core Benefits - Simplified */}
      <div className="max-w-xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: Shield,
              title: "Safe & Secure",
            },
            {
              icon: Clock,
              title: "Quick Booking",
            },
            {
              icon: CalendarCheck,
              title: "Flexible Options",
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-2 text-accent-kente-gold">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="mt-1 text-center">
                <p className="text-xs font-medium text-gray-900 dark:text-white">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Browse Routes Button */}
      <div className="max-w-xl mx-auto px-4 mt-6 mb-12">
        <button
          onClick={openBookingWidget}
          className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3 text-center font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center"
        >
          <Navigation className="h-5 w-5 mr-2 text-accent-kente-gold" />
          Browse All Routes
        </button>
      </div>

      {/* Booking Widget Modal */}
      {isWidgetOpen && (
        <BookingWidget 
          onComplete={handleBookingComplete} 
          onCancel={closeBookingWidget}
          origin={origin}
          destination={destination} 
        />
      )}
    </div>
  );
};

export default BookingPage;