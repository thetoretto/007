import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Calendar, CreditCard, Users, Clock, Star } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-primary-600 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/7245532/pexels-photo-7245532.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Bus transportation"
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Book Your Journey with Confidence
          </h1>
          <p className="text-xl max-w-3xl mb-8">
            Simple, affordable, and reliable transportation to get you where you need to go.
            Choose your route, pick your seat, and travel in comfort.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/book" className="btn bg-white text-primary-700 hover:bg-gray-100 font-medium py-3 px-6 text-base">
              Book a Ride
            </Link>
            <Link to="/about" className="btn bg-transparent text-white border border-white hover:bg-white/10 font-medium py-3 px-6 text-base">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Booking your next journey is easy with our simple step-by-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
                <Map className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select Your Route</h3>
              <p className="text-gray-600">
                Choose from our wide selection of routes connecting major destinations.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Pick Date & Time</h3>
              <p className="text-gray-600">
                Select the date and time that works best for your schedule.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Book & Pay</h3>
              <p className="text-gray-600">
                Secure your seat with our simple payment process and receive instant confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              We're committed to providing the best travel experience for all our passengers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Comfortable Vehicles</h3>
              <p className="text-gray-600">
                Modern fleet with spacious seating, air conditioning, and onboard amenities.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reliable Service</h3>
              <p className="text-gray-600">
                Punctual departures and arrivals to keep your schedule on track.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 mb-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Affordable Prices</h3>
              <p className="text-gray-600">
                Competitive rates with transparent pricing and no hidden fees.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">5-Star Experience</h3>
              <p className="text-gray-600">
                Exceptional customer service from booking to arrival at your destination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-600 rounded-2xl text-white overflow-hidden shadow-xl">
            <div className="px-6 py-12 md:p-12 md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Ready to Book Your Next Trip?</h2>
                <p className="mt-3 max-w-3xl text-primary-100">
                  Experience the comfort and convenience of traveling with us. Book now and enjoy a hassle-free journey.
                </p>
              </div>
              <div className="mt-8 md:mt-0 flex">
                <Link 
                  to="/book" 
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;