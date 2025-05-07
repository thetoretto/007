import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Calendar, CreditCard, Users, Clock, Star } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../index.css';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section - Modernized Styling */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 text-gray-800 overflow-hidden">
        <div className="container-app py-24 sm:py-32 md:py-40 flex flex-col items-center text-center">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-primary-700"
          >
            Your Journey, Simplified
          </h1>
          <p 
            className="text-lg sm:text-xl text-gray-600 max-w-2xl lg:max-w-3xl mb-10"
          >
            Effortless booking for comfortable and reliable transportation. Find your route, book your seat, and travel with ease.
          </p>
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link
              to="/book"
              className="btn btn-primary text-base px-8 py-3 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              Book Now
            </Link>
            <Link
              to="/learn-more"
              className="btn btn-outline text-primary-600 border-primary-600 hover:bg-primary-50 text-base px-8 py-3 transition-colors duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section - Modernized Styling */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-app">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Booking your ride takes just a few simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[Map, Calendar, CreditCard].map((Icon, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 lg:p-8 rounded-xl hover:shadow-lg transition-shadow duration-300 ease-in-out flex flex-col items-center text-center border border-gray-200"
              >
                <div className="bg-primary-100 text-primary-600 p-4 rounded-full mb-6 inline-flex items-center justify-center ring-4 ring-primary-50">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {['Select Route', 'Choose Date & Time', 'Book & Pay Securely'][index]}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {[ 
                    'Browse available routes and select your desired destination.',
                    'Pick the most convenient date and time slot for your travel.',
                    'Complete your booking with our secure payment system and get instant confirmation.'
                  ][index]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Modernized Styling */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container-app">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Why Travel With Us?</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our commitment to quality and service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[Users, Clock, CreditCard, Star].map((Icon, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out border border-gray-200 flex flex-col items-start"
              >
                <div className="bg-secondary-100 text-secondary-600 p-3 rounded-lg mb-5 inline-flex items-center justify-center ring-4 ring-secondary-50">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {['Modern Fleet', 'Punctual Service', 'Affordable Fares', 'Top-Rated Experience'][index]}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {[ 
                    'Travel in comfort with our well-maintained, air-conditioned vehicles.',
                    'We value your time. Count on us for on-time departures and arrivals.',
                    'Get the best value with competitive pricing and no surprise charges.',
                    'Join thousands of satisfied passengers who rate our service highly.'
                  ][index]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Modernized Styling */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container-app max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready for Your Next Adventure?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-100">
            Don't wait! Book your seat today and experience seamless travel with RideBooker.
          </p>
          <div className="mt-10">
            <Link 
              to="/book" 
              className="btn btn-secondary text-base px-10 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              Book Your Ride Now
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;