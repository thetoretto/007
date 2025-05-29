import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, Calendar, CreditCard, Users, Clock, Star, MapPin, Target, Shield, CheckCircle, ArrowRight, Moon, Sun } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../index.css';

const HomePage: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
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
    <div>
      <Navbar />
      {/* Hero Section - full width */}
      <section className="relative h-screen overflow-hidden">
        {/* Background with enhanced light/dark mode support */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900 transition-all duration-500"></div>
        
        {/* Abstract shapes for visual interest - using new color system */}
        <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-primary-500/10 dark:bg-primary-700/10 blur-3xl transition-all duration-500 opacity-70 dark:opacity-50"></div>
        <div className="absolute -bottom-20 left-[5%] w-96 h-96 rounded-full bg-darkBlue-500/5 dark:bg-darkBlue-700/5 blur-3xl transition-all duration-500 opacity-60 dark:opacity-40"></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 hero-pattern-overlay z-0"></div>
        
        {/* Content */}
        <div className="container-app relative z-10 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full">
            {/* Left side - Hero text with enhanced animations */}
            <div className={`text-center lg:text-left space-y-6 ${animateHero ? 'animate-slide-up' : 'opacity-0'}`}>
              <div className="inline-flex items-center px-3 py-1 rounded-full glass-effect text-white dark:text-gray-200 text-xs transition-all duration-300">
                <span className="mr-2 flex-shrink-0 w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                Africa's Premier Ride-Sharing Platform
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white dark:text-gray-50 leading-tight transition-colors duration-300">
                Travel Across Africa <span className="text-primary-400 dark:text-primary-300">Effortlessly</span>
              </h1>
              
              <p className="text-lg text-gray-200 dark:text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0 transition-colors duration-300">
                Safe, affordable, and convenient transportation connecting major cities across Africa.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <Link 
                  to="/book" 
                  className="btn btn-primary btn-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  Book Now
                </Link>
                <a 
                  href="#how-it-works" 
                  className="btn btn-outline border-white/50 text-white hover:bg-white/20 dark:border-gray-600/50 dark:text-gray-200 dark:hover:bg-gray-700/30 px-8 py-3 transition-all"
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
                  <div key={i} className="flex items-center space-x-2 text-white dark:text-gray-200 glass-effect px-3 py-1.5 rounded-full transition-all duration-300">
                    <item.icon className="h-4 w-4 text-primary-400 dark:text-primary-300" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Enhanced Booking form */}
            <div className={`w-full max-w-md mx-auto lg:ml-auto ${animateHero ? 'animate-slide-up animation-delay-300' : 'opacity-0'}`}>
              <div className="glass-card p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
                {/* Decorative element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary-500/10 dark:bg-primary-700/10 blur-3xl pointer-events-none opacity-70 dark:opacity-50"></div>
                
                <h2 className="text-xl font-semibold text-white dark:text-gray-100 mb-5 text-center relative z-10">Find Your Ride</h2>
                
                <div className="space-y-4 relative z-10">
                  {/* Origin */}
                  <div>
                    <label htmlFor="origin" className="block text-white dark:text-gray-200 text-sm mb-1">From</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <MapPin className="text-primary-400 dark:text-primary-300 h-5 w-5" />
                      </div>
                      <input
                        id="origin"
                        type="text"
                        placeholder="Enter starting point"
                        className="w-full pl-10 py-3 bg-white/5 dark:bg-black/10 text-white dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-500 border border-white/20 dark:border-gray-700/30 rounded-lg focus:ring-2 focus:ring-primary-500/70 dark:focus:ring-primary-400/70 focus:border-primary-500/50 dark:focus:border-primary-400/50 transition-all"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Destination */}
                  <div>
                    <label htmlFor="destination" className="block text-white dark:text-gray-200 text-sm mb-1">To</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Target className="text-primary-400 dark:text-primary-300 h-5 w-5" />
                      </div>
                      <input
                        id="destination"
                        type="text"
                        placeholder="Where are you going?"
                        className="w-full pl-10 py-3 bg-white/5 dark:bg-black/10 text-white dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-500 border border-white/20 dark:border-gray-700/30 rounded-lg focus:ring-2 focus:ring-primary-500/70 dark:focus:ring-primary-400/70 focus:border-primary-500/50 dark:focus:border-primary-400/50 transition-all"
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
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0' 
                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Find Available Rides
                  </button>
                  
                  {/* Popular destinations */}
                  <div>
                    <p className="text-white/70 dark:text-gray-400/70 text-xs mb-2">Popular destinations:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularDestinations.map((city, i) => (
                        <button 
                          key={i} 
                          className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30 text-white/80 hover:text-white dark:text-gray-300/80 dark:hover:text-gray-200 rounded-full transition-colors"
                          onClick={() => handleQuickBooking(city)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Extra info */}
                  <div className="pt-2 flex justify-between text-xs text-white/60">
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1 text-primary-400 dark:text-primary-300" />
                      <span>24/7 Service</span>
                    </div>
                    <div className="flex items-center">
                      <Shield size={12} className="mr-1 text-primary-400 dark:text-primary-300" />
                      <span>Secure Booking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a href="#how-it-works" className="flex flex-col items-center text-white/70 hover:text-white transition-colors">
            <span className="text-sm mb-1">Discover More</span>
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </a>
        </div>
      </section>
      {/* How It Works Section - container */}
      <section id="how-it-works" className="section-padding bg-white dark:bg-gray-800 relative overflow-hidden transition-colors duration-300">
        <div className="container-app">
          <div className="text-center mb-16">
            <span className="badge badge-primary inline-block mb-4">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-300">
              Book Your Ride in <span className="text-primary-600 dark:text-primary-400">Minutes</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg transition-colors duration-300">
              Our streamlined process makes booking transportation quick and hassle-free.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connecting line between steps (desktop only) */}
            <div className="absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-600 dark:via-primary-400 to-transparent hidden md:block">
              <div className="absolute left-[16.67%] top-0 w-4 h-4 rounded-full bg-primary-600 dark:bg-primary-400 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute left-1/2 top-0 w-4 h-4 rounded-full bg-primary-600 dark:bg-primary-400 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute left-[83.33%] top-0 w-4 h-4 rounded-full bg-primary-600 dark:bg-primary-400 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            {[
              {
                icon: MapPin,
                title: "Choose Your Route",
                description: "Enter your pickup and destination locations to find available rides."
              },
              {
                icon: Calendar,
                title: "Select Time & Seats",
                description: "Pick your preferred departure time and the number of seats you need."
              },
              {
                icon: CreditCard,
                title: "Pay & Confirm",
                description: "Complete your booking with secure payment and receive instant confirmation."
              }
            ].map((step, index) => (
              <div 
                key={index} 
                className="feature-card animate-on-scroll group hover:border-primary-600 dark:hover:border-primary-400"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="icon-badge icon-badge-lg icon-badge-primary group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-all mx-auto">
                  <step.icon size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white group-hover:text-primary-400 transition-colors duration-300">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center transition-colors duration-300">{step.description}</p>
                
                {/* Step number indicator */}
                <div className="flex items-center justify-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-full bg-primary-500/10 dark:bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold group-hover:bg-primary-500 group-hover:text-white transition-colors">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <button className="btn btn-primary btn-lg shadow-md hover:shadow-primary-600 hover:-translate-y-0.5 transition-all duration-300">
              Book Your Ride Now
            </button>
          </div>
        </div>
      </section>
      {/* Features Section - container */}
      <section className="section-padding bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors duration-300">
        <div className="container-app">
          <div className="text-center mb-16">
            <span className="badge badge-primary inline-block mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-300">
              The Best Way to <span className="text-primary-400 dark:text-primary-300">Travel</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              We provide exceptional service with features designed for your comfort and convenience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "Verified drivers, real-time tracking, and 24/7 customer support for a secure journey."
              },
              {
                icon: Star,
                title: "Premium Experience",
                description: "Comfortable, air-conditioned vehicles that meet high quality standards."
              },
              {
                icon: CheckCircle,
                title: "Transparent Pricing",
                description: "No hidden fees or surcharges. Know exactly what you'll pay upfront."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="feature-card animate-on-scroll hover:border-primary-600 dark:hover:border-primary-400"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-primary-400 dark:text-primary-300 mb-6">
                  <feature.icon className="h-10 w-10 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Call to Action Section - full width */}
      <section className="section-padding hero-gradient-light dark:hero-gradient-dark text-white relative overflow-hidden transition-colors duration-300">
        <div className="container-app">
          <div className="max-w-3xl mx-auto">
            <span className="glass-effect px-4 py-1.5 rounded-full text-white text-sm font-medium inline-block mb-6">
              Limited Time Offer
            </span>
            
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Travel with <span className="text-gradient-gold">Us?</span>
            </h2>
            
            <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto transition-colors duration-300">
              Join thousands of satisfied customers across Africa and experience premium transportation services.
            </p>
            
            <Link 
              to="/book" 
              className="btn btn-primary btn-lg group hover:-translate-y-0.5 active:translate-y-0"
            >
              Book Your Ride Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { number: "2M+", text: "Happy Travelers" },
                { number: "25+", text: "African Cities" },
                { number: "4.9", text: "Customer Rating" }
              ].map((stat, index) => (
                <div key={index} className="glass-effect p-4 rounded-lg transition-all duration-300">
                  <div className="text-2xl font-bold text-primary-400">{stat.number}</div>
                  <div className="text-sm text-gray-200">{stat.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;