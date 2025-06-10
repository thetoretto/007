import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, CreditCard, Users, Clock, Star, MapPin, Target, Shield, CheckCircle, ArrowRight, 
  Zap, Globe, Heart, Award, TrendingUp, Sparkles, Play, ChevronRight, Phone, Mail, 
  Navigation, Compass, Route, Car, Plane, Train, Bus, Wifi, Coffee, Music, AirVent
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../index.css';

const HomePage: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [animateHero, setAnimateHero] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Popular destinations for suggestions
  const popularDestinations = [
    'Kigali', 'Rubavu', 'Huye', 'Musanze', 'Goma', 'Bukavu', 'Nyagatare', 'Muhanga'
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Amara Okafor",
      role: "Business Traveler",
      location: "Lagos, Nigeria",
      content: "RSA has revolutionized my business trips across Africa. The comfort, reliability, and professional service are unmatched. I've saved countless hours and stress!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Jean-Baptiste Uwimana",
      role: "University Student",
      location: "Kigali, Rwanda",
      content: "As a student traveling between cities for internships, RSA's affordable prices and safe rides have been a lifesaver. The booking process is so simple!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Fatima Al-Rashid",
      role: "Tourism Guide",
      location: "Cairo, Egypt",
      content: "I recommend RSA to all my tour groups. The vehicles are always clean, drivers are professional, and the real-time tracking gives everyone peace of mind.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  useEffect(() => {
    // Trigger hero animation after component mounts
    setTimeout(() => setAnimateHero(true), 300);

    // Handle scroll animations
    const handleScroll = () => {
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
    setTimeout(handleScroll, 500);
    
    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(testimonialInterval);
    };
  }, [testimonials.length]);

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
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section - Completely Redesigned */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-light via-purple/5 to-primary/10 dark:from-dark dark:via-purple/10 dark:to-primary/5">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple/30 rounded-full blur-lg animate-float-delayed"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-accent/10 rounded-full blur-2xl animate-float-slow"></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-secondary/20 rounded-full blur-md animate-pulse"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div className="grid grid-cols-12 h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-primary/20"></div>
              ))}
            </div>
          </div>
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple/5"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-light/50 dark:to-dark/50"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              {/* Left side - Enhanced Hero Content */}
              <div className={`space-y-8 ${animateHero ? 'animate-slide-up' : 'opacity-0'}`}>
                {/* Status Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-primary mr-2 animate-pulse" />
                  <span className="text-sm font-medium text-primary">Africa's #1 Travel Platform</span>
                </div>

                {/* Main Headline */}
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                    <span className="text-black dark:text-white">Journey Beyond</span>
                    <br />
                    <span className="text-gradient bg-gradient-to-r from-primary via-purple to-accent bg-clip-text text-transparent">
                      Boundaries
                    </span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-dark dark:text-light max-w-2xl leading-relaxed">
                    Experience premium transportation across Africa with our cutting-edge platform.
                    Connect cities, cultures, and communities with unmatched comfort and reliability.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/booking" 
                    className="btn btn-primary btn-lg group hover:shadow-2xl hover:shadow-primary-700/25 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <button 
                    onClick={() => setIsVideoPlaying(true)}
                    className="btn btn-secondary group flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  {[
                    { icon: Users, number: "2M+", label: "Happy Travelers" },
                    { icon: Globe, number: "25+", label: "African Cities" },
                    { icon: Star, number: "4.9", label: "Average Rating" }
                  ].map((stat, i) => (
                    <div key={i} className="text-center group">
                      <div className="icon-badge icon-badge-lg bg-primary/10 text-primary mx-auto mb-2 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div className="text-2xl font-bold text-black dark:text-white">{stat.number}</div>
                      <div className="text-sm text-dark dark:text-light">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Revolutionary Booking Interface */}
              <div className={`${animateHero ? 'animate-slide-up animation-delay-300' : 'opacity-0'}`}>
                <div className="card p-8 relative overflow-hidden bg-gradient-to-br from-white/95 to-white/80 dark:from-dark/95 dark:to-dark/80 backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
                  {/* Decorative elements */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/20 to-purple/20 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-2xl"></div>
                  
                  {/* Header */}
                  <div className="relative z-10 text-center mb-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                      <Navigation className="w-4 h-4 text-primary mr-2" />
                      <span className="text-sm font-medium text-primary">Quick Booking</span>
                    </div>
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Plan Your Journey</h2>
                    <p className="text-dark dark:text-light">Book your ride in under 60 seconds</p>
                  </div>

                  {/* Booking Form */}
                  <div className="space-y-6 relative z-10">
                    {/* Route Selection */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-black dark:text-white">
                          <MapPin className="w-4 h-4 inline mr-2 text-accent" />
                          From
                        </label>
                        <input
                          type="text"
                          placeholder="Enter departure city"
                          className="input-field w-full"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-black dark:text-white">
                          <Target className="w-4 h-4 inline mr-2 text-primary" />
                          To
                        </label>
                        <input
                          type="text"
                          placeholder="Enter destination city"
                          className="input-field w-full"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Search Button */}
                    <button
                      onClick={navigateToBooking}
                      disabled={!origin || !destination}
                      className={`btn w-full py-4 text-lg font-semibold transition-all duration-300 ${
                        origin && destination
                          ? 'btn-primary shadow-xl hover:shadow-2xl hover:-translate-y-1 group'
                          : 'opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <Compass className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Find Your Ride
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    {/* Popular Destinations */}
                    <div>
                      <p className="text-sm text-light-secondary dark:text-dark-secondary mb-3">Popular destinations:</p>
                      <div className="flex flex-wrap gap-2">
                        {popularDestinations.map((city, i) => (
                          <button
                            key={i}
                            className="px-3 py-1.5 text-xs bg-primary-light hover:bg-primary hover:text-black text-primary rounded-full transition-all duration-300 border border-primary-medium hover:border-primary"
                            onClick={() => handleQuickBooking(city)}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Trust Indicators */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-light dark:border-dark">
                      <div className="flex items-center text-sm text-light-secondary dark:text-dark-secondary">
                        <Shield className="w-4 h-4 mr-2 text-secondary" />
                        <span>Secure & Safe</span>
                      </div>
                      <div className="flex items-center text-sm text-light-secondary dark:text-dark-secondary">
                        <Clock className="w-4 h-4 mr-2 text-purple" />
                        <span>24/7 Support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Action Elements */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a href="#features" className="flex flex-col items-center text-light-secondary dark:text-dark-secondary hover:text-primary-700 transition-colors group">
            <span className="text-sm mb-2 opacity-0 group-hover:opacity-100 transition-opacity">Explore Features</span>
            <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:border-primary-700 transition-colors">
              <ChevronRight className="w-5 h-5 rotate-90" />
            </div>
          </a>
        </div>
      </section>

      {/* Features Section - Revolutionary Design */}
      <section id="features" className="py-20 lg:py-32 bg-gradient-to-b from-light to-white dark:from-dark dark:to-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-24 animate-on-scroll">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Award className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Premium Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
              <span className="text-black dark:text-white">Why Choose</span>
              <br />
              <span className="text-gradient bg-gradient-to-r from-primary to-purple bg-clip-text text-transparent">RSA Travel</span>
            </h2>
            <p className="text-lg sm:text-xl text-dark dark:text-light max-w-3xl mx-auto leading-relaxed">
              Experience the future of transportation with our innovative features designed for modern travelers
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Shield,
                title: "Military-Grade Security",
                description: "Advanced encryption, verified drivers, and real-time monitoring ensure your safety throughout the journey.",
                color: "secondary",
                features: ["Background-checked drivers", "Real-time GPS tracking", "Emergency assistance"]
              },
              {
                icon: Zap,
                title: "Lightning-Fast Booking",
                description: "Book your ride in under 30 seconds with our AI-powered matching system and instant confirmations.",
                color: "primary",
                features: ["AI-powered matching", "Instant confirmations", "Smart route optimization"]
              },
              {
                icon: Heart,
                title: "Comfort Redefined",
                description: "Premium vehicles with luxury amenities, climate control, and entertainment systems for the perfect journey.",
                color: "accent",
                features: ["Premium vehicles", "Climate control", "Entertainment systems"]
              },
              {
                icon: Globe,
                title: "Pan-African Network",
                description: "Seamlessly travel across 25+ African cities with our extensive network of trusted partners.",
                color: "purple",
                features: ["25+ African cities", "Trusted partners", "Seamless connections"]
              },
              {
                icon: TrendingUp,
                title: "Smart Pricing",
                description: "Dynamic pricing that adapts to demand while ensuring fair rates and transparent billing.",
                color: "purple",
                features: ["Dynamic pricing", "Transparent billing", "No hidden fees"]
              },
              {
                icon: Star,
                title: "5-Star Experience",
                description: "Consistently rated 4.9/5 by travelers for exceptional service, punctuality, and customer care.",
                color: "primary",
                features: ["4.9/5 rating", "Exceptional service", "24/7 support"]
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="card card-interactive p-8 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-on-scroll"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`icon-badge icon-badge-lg bg-primary-light text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-black transition-all duration-300`}>
                  <feature.icon className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-black dark:text-white mb-4 text-center">
                  {feature.title}
                </h3>

                <p className="text-dark dark:text-light mb-6 text-center leading-relaxed">
                  {feature.description}
                </p>

                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-dark dark:text-light">
                      <CheckCircle className={`w-4 h-4 mr-2 text-primary flex-shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Interactive Carousel */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-purple/5 to-light dark:from-primary/10 dark:via-purple/10 dark:to-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Heart className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Customer Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-black dark:text-white">Loved by</span>
              <br />
              <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Millions</span>
            </h2>
            <p className="text-lg text-dark dark:text-light max-w-2xl mx-auto">
              Join over 2 million satisfied travelers who trust RSA for their journeys across Africa
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <div className="card p-8 lg:p-12 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>

              {/* Testimonial Content */}
              <div className="relative z-10 text-center">
                <div className="mb-8">
                  <div className="flex justify-center mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-primary fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-xl lg:text-2xl font-medium text-black dark:text-white leading-relaxed mb-8">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-primary/20"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-black dark:text-white">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-sm text-dark dark:text-light">
                      {testimonials[currentTestimonial].role}
                    </div>
                    <div className="text-xs text-secondary">
                      {testimonials[currentTestimonial].location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'bg-primary scale-125'
                      : 'bg-primary/30 hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary via-primary/90 to-purple relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-medium text-white">Ready to Travel?</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6">
              Your Next Adventure
              <br />
              <span className="text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Awaits
              </span>
            </h2>

            <p className="text-lg lg:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join millions of travelers who choose RSA for safe, comfortable, and reliable transportation across Africa.
              Your journey starts with a single click.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/booking"
                className="btn bg-white text-black hover:bg-white/90 btn-lg group shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 transition-all duration-300"
              >
                <Zap className="w-5 h-5 mr-2" />
                Book Your Ride Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/learn-more"
                className="btn border-2 border-white/30 text-white hover:bg-white/10 btn-lg group"
              >
                <Globe className="w-5 h-5 mr-2" />
                Learn More
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[
                { icon: Users, number: "2M+", label: "Happy Travelers" },
                { icon: Globe, number: "25+", label: "African Cities" },
                { icon: Star, number: "4.9", label: "Average Rating" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="icon-badge icon-badge-lg bg-white/10 text-white mx-auto mb-3">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
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
