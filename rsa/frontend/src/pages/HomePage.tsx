import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, Calendar, CreditCard, Users, Clock, Star, MapPin, Target } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../index.css';

const HomePage: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [animateHero, setAnimateHero] = useState(false);

  // Popular destinations for suggestions
  const popularDestinations = [
    'Rubavu', 'Huye', 'Musanze', 'Goma', 'Bukavu', 'Kigali'
  ];

  useEffect(() => {
    // Trigger hero animation after component mounts
    setTimeout(() => setAnimateHero(true), 300);

    // Handle scroll animations
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Find all elements with animate-on-scroll class
      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      
      animatedElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = (rect.top <= window.innerHeight * 0.85);
        
        if (isVisible) {
          el.classList.add('visible');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    // Trigger once on load
    setTimeout(handleScroll, 500);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigate to booking page with parameters
  const navigateToBooking = () => {
    if (origin && destination) {
      window.location.href = `/booking?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    }
  };

  // Handle quick booking based on suggestion
  const handleQuickBooking = (dest: string) => {
    setDestination(dest);
    // Set a default origin if none is selected
    if (!origin) {
      setOrigin('Kigali');
    }
    setTimeout(() => {
      navigateToBooking();
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900 to-black z-0"></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full">
            {/* Left side - Hero text */}
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Travel Across Africa <span className="text-accent-kente-gold">Effortlessly</span>
              </h1>
              
              <p className="text-lg text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Safe, affordable, and convenient transportation connecting major cities across Africa.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <Link 
                  to="/book" 
                  className="px-8 py-3 bg-accent-kente-gold text-black font-medium rounded-lg hover:opacity-90 transition-all"
                >
                  Book Now
                </Link>
                <a 
                  href="#how-it-works" 
                  className="px-8 py-3 bg-white/10 text-white border border-white/20 font-medium rounded-lg hover:bg-white/20 transition-all"
                >
                  How It Works
                </a>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
                {[
                  { icon: Users, text: "2M+ Travelers" },
                  { icon: Map, text: "25+ Cities" },
                  { icon: Star, text: "4.9 Rating" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 text-white">
                    <item.icon className="h-5 w-5 text-accent-kente-gold" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Booking form */}
            <div className="w-full max-w-md mx-auto lg:ml-auto">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-5 text-center">Find Your Ride</h2>
                
                <div className="space-y-4">
                  {/* Origin */}
                  <div>
                    <label htmlFor="origin" className="block text-white text-sm mb-1">From</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <MapPin className="text-accent-kente-gold h-5 w-5" />
                      </div>
                      <input
                        id="origin"
                        type="text"
                        placeholder="Enter starting point"
                        className="w-full pl-10 py-3 bg-white/5 text-white border border-white/20 rounded-lg focus:ring-1 focus:ring-accent-kente-gold focus:border-accent-kente-gold"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Destination */}
                  <div>
                    <label htmlFor="destination" className="block text-white text-sm mb-1">To</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Target className="text-accent-kente-gold h-5 w-5" />
                      </div>
                      <input
                        id="destination"
                        type="text"
                        placeholder="Where are you going?"
                        className="w-full pl-10 py-3 bg-white/5 text-white border border-white/20 rounded-lg focus:ring-1 focus:ring-accent-kente-gold focus:border-accent-kente-gold"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Search button */}
                  <button
                    onClick={navigateToBooking}
                    disabled={!origin || !destination}
                    className={`w-full py-3 rounded-lg font-medium mt-2 transition-all ${
                      origin && destination 
                        ? 'bg-accent-kente-gold text-black hover:opacity-90' 
                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Find Available Rides
                  </button>
                  
                  {/* Popular destinations */}
                  <div>
                    <p className="text-white/70 text-xs mb-2">Popular destinations:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularDestinations.map((city, i) => (
                        <button 
                          key={i} 
                          className="px-2 py-1 text-xs bg-white/5 hover:bg-accent-kente-gold/20 text-white/80 hover:text-white rounded-full transition-colors"
                          onClick={() => handleQuickBooking(city)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our streamlined process makes booking transportation quick and hassle-free.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Choose Your Route",
                description: "Enter your pickup and destination locations."
              },
              {
                icon: Calendar,
                title: "Select Time & Seats",
                description: "Pick your preferred departure time and seats."
              },
              {
                icon: CreditCard,
                title: "Pay & Confirm",
                description: "Secure payment and instant confirmation."
              }
            ].map((step, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-800 mb-4 text-primary-800 dark:text-primary-100">
                  <step.icon size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Travel with Us?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers across Africa.
          </p>
          <Link 
            to="/book" 
            className="inline-block px-8 py-4 bg-accent-kente-gold text-black font-medium rounded-lg hover:opacity-90 transition-all"
          >
            Book Your Ride Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage; 