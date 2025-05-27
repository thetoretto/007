import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Map, Calendar, CreditCard, Users, Clock, Star, MapPin, Navigation, Search, Target, CheckCircle, Shield, Award, TrendingUp } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../index.css'; // Contains all our styles including animations
import '../styles/animations.css'; // New animations

// TypeScript interfaces for our component props
interface TrustIndicator {
  icon: React.ElementType;
  text: string;
}

interface ProcessStep {
  icon: React.ElementType;
  title: string;
  desc: string;
  step: string;
  color: string;
  darkShadow: string;
}

interface Feature {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  delay: string;
  gradient: string;
}

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  image: string;
  delay: string;
  accent: string;
}

const HomePage: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('standard');
  const [animateHero, setAnimateHero] = useState(false);

  // Popular destinations for suggestions
  const popularDestinations = [
    'Rubavu', 'Huye ', 'Musanze ', 'Goma', 'Bukavu', 'Kigali'
  ];

  // Ref for animation elements
  const animatedElementsRef = useRef<HTMLElement[]>([]);

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background-dark"> {/* Added dark mode background for overall page */}
      <Navbar />

      {/* Interactive Hero Section with Animation */}
      <section className={`relative min-h-[90vh] overflow-hidden flex items-center ${animateHero ? 'animate-fade-in' : 'opacity-0'}`}>
        {/* Plain Background with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-black z-10"></div>
          
          {/* Background pattern element */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 right-0 h-20 bg-[url('/images/kente-pattern.svg')] bg-repeat-x"></div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-[url('/images/kente-pattern.svg')] bg-repeat-x"></div>
          </div>
          
          {/* Subtle animated dots */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute w-4 h-4 rounded-full bg-accent-kente-gold top-1/4 left-1/4 animate-pulse"></div>
            <div className="absolute w-3 h-3 rounded-full bg-accent-red top-3/4 left-1/3 animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute w-5 h-5 rounded-full bg-accent-green top-1/2 right-1/4 animate-pulse" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute w-4 h-4 rounded-full bg-accent-kente-gold bottom-1/4 right-1/3 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute w-3 h-3 rounded-full bg-accent-red-light top-1/3 right-1/2 animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
        </div>

        <div className="container-app relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`text-center lg:text-left space-y-6 ${animateHero ? 'animate-slide-up' : ''}`}>
              <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-accent-kente-gold to-accent-red text-black text-sm font-medium mb-2 animate-pulse">
                Experience Africa&apos;s Premier Ride-Sharing
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                <span className="block text-accent-kente-gold">Connect</span> Your Journey 
                <span className="block mt-1">Across Africa</span>
              </h1>
              
              <p className="text-xl text-gray-200 max-w-xl">
                Experience safe, affordable and convenient transportation. From city commutes to cross-country travel, we've got you covered.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 py-4">
                {[
                  { icon: Users, text: "2M+ Users" },
                  { icon: Map, text: "25+ Cities" },
                  { icon: Star, text: "4.9 Rating" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                    <item.icon className="h-4 w-4 text-accent-kente-gold" />
                    <span className="text-white text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Download App Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-6">
                <a href="#download" className="btn-hero-primary">
                  <span className="mr-2">🚗</span> Download App
                </a>
                <a href="#learn" className="btn-hero-secondary">
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Content - Ride Booking Card */}
            <div className={`${animateHero ? 'animate-slide-up-delayed' : ''}`}>
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
                <div className="flex justify-between mb-6">
                  {['Private ', 'Public'].map((tab) => (
                    <button 
                      key={tab}
                      className={`flex-1 py-3 text-center capitalize font-medium rounded-lg transition ${activeTab === tab ? 'bg-accent-kente-gold text-black' : 'text-white hover:bg-white/10'}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-4">
                  {/* Origin Input */}
                  <div className="relative">
              
                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      className="w-full pl-10 pr-4 py-4 rounded-xl bg-black/30 text-white border border-gray-700 focus:border-accent-kente-gold outline-none transition"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent-kente-gold">
                      <MapPin size={18} />
                    </button>
                  </div>
                  
                  {/* Destination Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter destination"
                      className="w-full pl-10 pr-4 py-4 rounded-xl bg-black/30 text-white border border-gray-700 focus:border-accent-kente-gold outline-none transition"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent-kente-gold">
                      <Target size={18} />
                    </button>
                  </div>
                  
                  {/* Popular Destinations */}
                  <div className="pt-2">
                    <p className="text-gray-400 text-sm mb-2">Popular destinations:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularDestinations.map((city, i) => (
                        <button 
                          key={i} 
                          className="px-3 py-1 text-sm bg-white/10 hover:bg-accent-kente-gold hover:text-black rounded-full text-gray-200 transition"
                          onClick={() => setDestination(city)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Book Now Button */}
                  <button className="w-full py-4 mt-4 bg-gradient-to-r from-accent-kente-gold to-accent-red text-black font-bold rounded-xl hover:shadow-lg hover:shadow-accent-kente-gold/20 transform hover:translate-y-[-2px] transition">
                    Book Your Ride Now
                  </button>
                  
                  {/* Extra Features */}
                  <div className="flex justify-between pt-4 text-sm text-gray-300">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 text-accent-kente-gold" />
                      <span>Available 24/7</span>
                    </div>
                    <div className="flex items-center">
                      <Shield size={14} className="mr-1 text-accent-kente-gold" />
                      <span>Secure Booking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="flex flex-col items-center cursor-pointer">
            <span className="text-sm mb-2">Scroll Down</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 20V4M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced with Visual Appeal */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background-default to-background-offset dark:from-background-dark dark:to-primary-900/20">
        {/* Background Pattern Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 top-10 w-64 h-64 bg-accent-kente-gold/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 bottom-10 w-72 h-72 bg-accent-red/10 rounded-full blur-3xl"></div>
          
          {/* African pattern element */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-[0.03] pointer-events-none">
            <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <pattern id="kente-pattern" patternUnits="userSpaceOnUse" width="80" height="80" patternTransform="rotate(45)">
                <rect width="100%" height="100%" fill="transparent"/>
                <rect x="0" y="0" width="40" height="80" fill="currentColor" />
                <rect x="40" y="0" width="40" height="80" fill="transparent" />
                <rect x="0" y="0" width="80" height="10" fill="currentColor" />
                <rect x="0" y="20" width="80" height="10" fill="currentColor" />
                <rect x="0" y="40" width="80" height="10" fill="currentColor" />
                <rect x="0" y="60" width="80" height="10" fill="currentColor" />
              </pattern>
              <circle cx="400" cy="400" r="390" fill="url(#kente-pattern)" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>
        
        <div className="container-app relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-20 animate-on-scroll">
            <span className="px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium inline-block mb-4">
              Journey Made Simple
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-accent-black dark:text-white mb-6">
              Experience <span className="text-accent-kente-gold">Seamless</span> African Travel
            </h2>
            <p className="text-section-subtitle max-w-2xl mx-auto">
              From bustling cities to peaceful villages, we connect all of Africa with just a few taps. Our platform combines traditional African hospitality with modern technology for a uniquely seamless experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connecting Line Between Steps (Desktop) */}
            <div className="absolute top-24 left-0 right-0 h-1 hidden md:block">
              <div className="relative w-full h-full">
                <div className="absolute left-[16.66%] right-[16.66%] top-0 h-full bg-accent-kente-gold/30"></div>
                <div className="absolute left-[16.66%] top-50% w-3 h-3 rounded-full bg-accent-kente-gold transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute left-1/2 top-50% w-3 h-3 rounded-full bg-accent-kente-gold transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute right-[16.66%] top-50% w-3 h-3 rounded-full bg-accent-kente-gold transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
            
            {[
              { 
                icon: MapPin, 
                title: 'Discover Your Route', 
                desc: 'Select from our extensive network covering major African cities and hidden gems across the continent.',
                step: '01',
                color: 'accent-red',
                darkShadow: 'accent-red/20'
              },
              { 
                icon: Calendar, 
                title: 'Plan Your Journey', 
                desc: 'Choose when to travel with flexible scheduling. Book instantly or plan ahead for your African adventure.',
                step: '02',
                color: 'accent-kente-gold',
                darkShadow: 'accent-kente-gold/20'
              },
              { 
                icon: CreditCard, 
                title: 'Travel with Confidence', 
                desc: 'Secure payment options including mobile money popular across Africa. Receive instant confirmation with driver details.',
                step: '03',
                color: 'accent-green',
                darkShadow: 'accent-green/20'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="card-feature group animate-on-scroll relative z-10 bg-white dark:bg-gray-900/60 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl dark:shadow-none hover:shadow-2xl transition-all duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative mb-10">
                  <div className={`card-feature-icon-wrapper inline-flex items-center justify-center w-16 h-16 rounded-xl bg-${item.color}/10 text-${item.color} group-hover:scale-110 group-hover:bg-${item.color} group-hover:text-white transition-all duration-300`}>
                    <item.icon className="h-8 w-8" />
                  </div>
          
                </div>
                
                <h3 className={`text-xl font-bold mb-4 group-hover:text-${item.color} transition-colors duration-300`}>
                  {item.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {item.desc}
                </p>
                
                <div className={`w-10 h-1 bg-${item.color}/50 group-hover:w-16 transition-all duration-300`}></div>
                
                {/* Mobile step indicator (visible only on mobile) */}
                <div className="md:hidden flex items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${item.color}/10 text-${item.color} text-sm font-medium mr-3`}>
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Step {index + 1} of 3</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with Interactive Cards */}
      <section className="py-20 relative bg-white dark:bg-black">
        <div className="container-app">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-on-scroll">
            <span className="px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium inline-block mb-4">
              Exceptional Experience
            </span>
            <h2 className="text-section-title mb-4">Why Travelers Choose Us</h2>
            <p className="text-section-subtitle max-w-2xl mx-auto">
              Our commitment to excellence sets us apart. Discover the advantages that make us Africa&apos;s leading ride-sharing platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {[
              { 
                icon: Shield, 
                title: 'Safe & Secure', 
                desc: `Verified drivers, real-time tracking, and 24/7 support ensure your safety throughout your journey.`,
                color: 'accent-red',
                delay: '0ms',
                gradient: 'from-accent-red/10 to-accent-red/5'
              },
              { 
                icon: Award, 
                title: 'Premium Fleet', 
                desc: `Travel in comfort with modern, air-conditioned vehicles that meet the highest quality standards.`,
                color: 'accent-kente-gold',
                delay: '100ms',
                gradient: 'from-accent-kente-gold/10 to-accent-kente-gold/5'
              },
              { 
                icon: TrendingUp, 
                title: 'Transparent Pricing', 
                desc: `No surge pricing or hidden fees. Know exactly what you'll pay before confirming your booking.`,
                color: 'accent-green',
                delay: '200ms',
                gradient: 'from-accent-green/10 to-accent-green/5'
              },
              { 
                icon: Clock, 
                title: 'Reliable Service', 
                desc: 'Punctual departures and arrivals with real-time updates to keep you informed at every step.',
                color: 'primary-800',
                delay: '300ms',
                gradient: 'from-primary-800/10 to-primary-800/5'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="feature-card-animated animate-on-scroll rounded-2xl h-full"
                style={{ 
                  animationDelay: item.delay
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl -z-10`}></div>
                <div className={`feature-icon bg-${item.color}/10 text-${item.color} mb-6`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="feature-title text-xl font-bold mb-3">{item.title}</h3>
                <p className="feature-desc text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - NEW */}
      <section className="py-20 bg-gradient-to-b from-background-default to-background-offset dark:from-background-dark dark:to-primary-900/20 relative overflow-hidden">
        {/* Background Pattern Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-accent-green/5 rounded-full blur-3xl"></div>
          <div className="absolute left-0 bottom-0 w-80 h-80 bg-accent-kente-gold/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-app relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-on-scroll">
            <span className="px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium inline-block mb-4">
              Traveler Experiences
            </span>
            <h2 className="text-section-title mb-4">What Our Customers Say</h2>
            <p className="text-section-subtitle max-w-2xl mx-auto">
              Join thousands of satisfied travelers who have transformed their journeys with our platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Amara Okafor",
                location: "Lagos, Nigeria",
                text: "This app has revolutionized how I commute to work. Reliable drivers, clean cars, and the fare estimator is spot on!",
                rating: 5,
                image: "/images/testimonials/amara.jpg",
                delay: "0ms",
                accent: "accent-kente-gold"
              },
              {
                name: "Kwame Mensah",
                location: "Accra, Ghana",
                text: "I use this service for both business and family trips. The cross-border options are amazing and have made traveling between countries so much easier.",
                rating: 5,
                image: "/images/testimonials/kwame.jpg",
                delay: "100ms",
                accent: "accent-red"
              },
              {
                name: "Zainab Hakimi",
                location: "Nairobi, Kenya",
                text: "As a woman traveling alone, safety is my priority. The driver verification and real-time tracking give me peace of mind every time.",
                rating: 5,
                image: "/images/testimonials/zainab.jpg",
                delay: "200ms",
                accent: "accent-green"
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="testimonial-card animate-on-scroll relative rounded-xl h-full"
                style={{ animationDelay: item.delay }}
              >
                {/* Accent border */}
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-${item.accent} rounded-t-xl`}></div>
                
                {/* Quote icon */}
                <div className={`absolute -top-3 right-4 w-8 h-8 rounded-full bg-${item.accent} text-white flex items-center justify-center`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 7L6 12H10V17H4V12L9 7H11Z M21 7L16 12H20V17H14V12L19 7H21Z" fill="currentColor"/>
                  </svg>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-full border-2 border-${item.accent} overflow-hidden`}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "/images/avatar-placeholder.jpg")} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-accent-black dark:text-white">{item.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.location}</p>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={`${i < item.rating ? `text-${item.accent} fill-${item.accent}` : 'text-gray-300'}`} />
                  ))}
                </div>
                
                <p className="testimonial-text text-base italic">&ldquo;{item.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Section - NEW */}
      {/* <section id="download" className="py-20 bg-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/images/map-pattern.svg')] bg-no-repeat bg-cover"></div>
        </div>
        
        <div className="container-app relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left animate-on-scroll">
              <span className="px-4 py-1.5 rounded-full bg-accent-kente-gold/20 text-accent-kente-gold text-sm font-medium inline-block mb-4">
                Take Us With You
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Download Our Mobile App
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Get the full experience with our mobile app. Book rides, track your journey, and access exclusive deals—all at your fingertips.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#" className="download-button">
                  <div className="download-button-content">
                    <div className="text-xs">Download on the</div>
                    <div className="text-xl font-semibold">App Store</div>
                  </div>
                </a>
                <a href="#" className="download-button">
                  <div className="download-button-content">
                    <div className="text-xs">Get it on</div>
                    <div className="text-xl font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
              
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
                <div className="text-4xl font-bold text-accent-kente-gold">4.9</div>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} className="text-accent-yellow fill-accent-yellow" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-300">20,000+ Reviews</div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-on-scroll" style={{ animationDelay: "200ms" }}>
              <div className="relative z-10 pl-10">
                <img 
                  src="/images/app-screenshot.png" 
                  alt="Mobile App Screenshot" 
                  className="rounded-[2rem] shadow-2xl max-w-[300px] mx-auto"
                  onError={(e) => (e.currentTarget.src = "https://placehold.co/300x600/1f2937/fff?text=App+Screenshot")}
                />
              </div>
              <div className="absolute top-0 left-0 w-[300px] h-[600px] bg-accent-kente-gold/30 rounded-[2rem] blur-xl -z-10 transform -translate-x-5 translate-y-5"></div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Enhanced CTA Section */}
      <section className="section-cta relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-black/90 z-0"></div>
        
        <div className="section-cta-content relative z-10">
          <div className="animate-on-scroll">
            <span className="px-6 py-2 rounded-full bg-accent-kente-gold text-black text-sm font-medium inline-block mb-6">
              Limited Time Offer
            </span>
            <h2 className="text-5xl font-bold mb-6 text-white">
              Get <span className="text-accent-kente-gold">25% Off</span> Your First Ride
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Experience premium transportation at a special introductory price. Sign up today and start your journey with a discount.
            </p>
            
            <Link 
              to="/book" 
              className="btn btn-primary text-base px-10 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out group"
            >
              Book Your Discounted Ride <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
            </Link>
            
            <p className="mt-6 text-sm text-gray-400">
              *Terms and conditions apply. Offer valid for new users only.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;