import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Calendar, CreditCard, Users, Clock, Star } from 'lucide-react';
import Navbar from '../components/common/Navbar'; // Assuming Navbar is already updated
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import Footer from '../components/common/Footer'; // Assuming Footer is already updated

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50"> {/* Changed bg to gray-50 for consistency */}
      <Navbar />
      {/* Hero Section - Refined Styling */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white overflow-hidden"> {/* Pocket-like gradient */}
        {/* Removed extra overlay div */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="relative max-w-7xl mx-auto px-4 py-28 sm:py-36 sm:px-6 lg:px-8 flex flex-col items-center text-center" /* Increased padding */
        >
          <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5"> {/* Bolder font */}
            Your Journey, Simplified
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-indigo-100 max-w-3xl mb-10"> {/* Adjusted text color and margin */}
            Effortless booking for comfortable and reliable transportation. Find your route, book your seat, and travel with ease.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/book"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 transition-colors duration-300" /* Pocket-like button */
            >
              Book Now
            </Link>
            <Link
              to="/learn-more"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-75 transition-opacity duration-300" /* Secondary button style */
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section - Refined Styling */}
      <section className="py-16 lg:py-24 bg-white"> {/* Changed bg to white */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">How It Works</h2> {/* Added tracking-tight */}
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Booking your ride takes just a few simple steps.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"> {/* Adjusted gap */}
            {[Map, Calendar, CreditCard].map((Icon, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex flex-col items-center text-center p-6 lg:p-8 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow duration-300" /* Rounded-xl, hover effect */
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-5"> {/* Adjusted icon bg/color/size */}
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {['Select Route', 'Choose Date & Time', 'Book & Pay Securely'][index]}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {[ 
                    'Browse available routes and select your desired destination.',
                    'Pick the most convenient date and time slot for your travel.',
                    'Complete your booking with our secure payment system and get instant confirmation.'
                  ][index]}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section - Refined Styling */}
      <section className="py-16 lg:py-24 bg-gray-50"> {/* Changed bg to gray-50 */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Why Travel With Us?</h2> {/* Added tracking-tight */}
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our commitment to quality and service.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"> {/* Adjusted gap */}
            {[Users, Clock, CreditCard, Star].map((Icon, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm" /* Rounded-xl, white bg, shadow-sm */
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center text-indigo-600 mb-4"> {/* Adjusted icon bg/color/size/shape */}
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section - Refined Styling */}
      <section className="py-16 lg:py-24 bg-indigo-700"> {/* Changed bg to indigo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Ready for Your Next Adventure?</h2> {/* Added tracking-tight */}
          <p className="mt-4 max-w-2xl mx-auto text-lg text-indigo-100"> {/* Adjusted text color */}
            Don't wait! Book your seat today and experience seamless travel with RideBooker.
          </p>
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="mt-10"
          >
            <Link 
              to="/book" 
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition-colors duration-300 shadow-lg" /* Pocket-like button */
            >
              Book Your Ride Now
            </Link>
          </motion.div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;