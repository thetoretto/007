import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Calendar, CreditCard, Users, Clock, Star } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../index.css';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background-dark"> {/* Added dark mode background for overall page */}
      <Navbar />

      {/* Hero Section - Modernized Styling */}
      <section className="section-cta">
        <div className="section-hero-content">
          <h1 
            className="text-title-hero mb-6"
          >
            Your Journey, Simplified
          </h1>
          <p 
            className="text-subtitle-hero mb-10"
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
              className="btn btn-secondary btn-outline   text-base px-8 py-3 transition-colors duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section - Modernized Styling */}
      <section className="section-default"> {/* Changed from bg-white to section-default */}
        <div className="container-app">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-section-title">How It Works</h2>
            <p className="text-section-subtitle">
              Booking your ride takes just a few simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[Map, Calendar, CreditCard].map((Icon, index) => (
              <div
                key={index}
                className="card-feature" /* Applied card-feature */
              >
                <div className="card-feature-icon-wrapper card-feature-icon-wrapper-primary">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-card-title">
                  {['Select Route', 'Choose Date & Time', 'Book & Pay Securely'][index]}
                </h3>
                <p className="text-card-description">
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
      <section className="section-offset"> {/* Changed from bg-gray-50 to section-offset */}
        <div className="container-app">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-section-title">Why Travel With Us?</h2>
            <p className="text-section-subtitle">
              Experience the difference with our commitment to quality and service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[Users, Clock, CreditCard, Star].map((Icon, index) => (
              <div
                key={index}
                className="card-base p-6 flex flex-col items-start" /* Applied card-base, kept p-6 and flex specific styles */
              >
                <div className="card-feature-icon-wrapper card-feature-icon-wrapper-secondary p-3 mb-5"> {/* Applied general wrapper and secondary variant, kept specific p-3 mb-5 */}
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-accent-black dark:text-text-inverse mb-2"> {/* Kept specific text style as text-card-title might be too large or different margin */}
                  {['Modern Fleet', 'Punctual Service', 'Affordable Fares', 'Top-Rated Experience'][index]}
                </h3>
                <p className="text-card-description">
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
      <section className="section-cta">
        <div className="section-cta-content">
          <h2 className="text-section-title">Ready for Your Next Adventure?</h2>
          <p className="text-section-subtitle">
            Don't wait! Book your seat today and experience seamless travel with RideBooker.
          </p>
          <div className="mt-10">
            <Link 
              to="/book" 
              className="btn btn-primary text-base px-10 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
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