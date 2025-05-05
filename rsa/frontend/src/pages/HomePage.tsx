import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Calendar, CreditCard, Users, Clock, Star } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import Footer from '../components/common/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-[600px] h-[600px] bg-gradient-radial from-white/30 blur-3xl animate-blob -top-48 -left-48" />
          <div className="absolute w-[600px] h-[600px] bg-gradient-radial from-white/20 blur-3xl animate-blob animation-delay-2000 top-48 -right-48" />
        </div>
        
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center"
        >
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Book Your Journey with Confidence
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-xl max-w-3xl mb-8">
            Simple, affordable, and reliable transportation to get you where you need to go.
            Choose your route, pick your seat, and travel in comfort.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/book"
              className="btn bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white font-medium py-3 px-6 text-base rounded-xl transition-all duration-300"
            >
              Book a Ride
            </Link>
            <Link
              to="/about"
              className="btn border-2 border-white/30 hover:border-white/50 bg-transparent text-white font-medium py-3 px-6 text-base rounded-xl transition-all duration-300"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Booking your next journey is easy with our simple step-by-step process
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[Map, Calendar, CreditCard].map((Icon, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {['Select Your Route', 'Pick Date & Time', 'Book & Pay'][index]}
                </h3>
                <p className="text-gray-600">
                  {[
                    'Choose from our wide selection of routes connecting major destinations.',
                    'Select the date and time that works best for your schedule.',
                    'Secure your seat with our simple payment process and receive instant confirmation.'
                  ][index]}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              We're committed to providing the best travel experience for all our passengers
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[Users, Clock, CreditCard, Star].map((Icon, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {['Comfortable Vehicles', 'Reliable Service', 'Affordable Prices', '5-Star Experience'][index]}
                </h3>
                <p className="text-gray-600">
                  {[
                    'Modern fleet with spacious seating, air conditioning, and onboard amenities.',
                    'Punctual departures and arrivals to keep your schedule on track.',
                    'Competitive rates with transparent pricing and no hidden fees.',
                    'Exceptional customer service from booking to arrival at your destination.'
                  ][index]}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="bg-primary-600 rounded-2xl text-white overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="px-6 py-12 md:p-12 md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Ready to Book Your Next Trip?</h2>
                <p className="mt-3 max-w-3xl text-primary-100">
                  Experience the comfort and convenience of traveling with us. Book now and enjoy a hassle-free journey.
                </p>
              </div>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="mt-8 md:mt-0 flex"
              >
                <Link 
                  to="/book" 
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-xl text-primary-700 bg-white hover:bg-primary-50 transition-colors duration-300"
                >
                  Book Now
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;