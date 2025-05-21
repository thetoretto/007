import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import '../../index.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Form section - on left for registration (opposite of login page) */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background-light dark:bg-background-dark h-full order-2 lg:order-1">
        <div className="flex-grow flex flex-col px-4 sm:px-6 lg:px-8 relative overflow-y-auto">
          {/* Navigation header - fixed within this section */}
          <div className="sticky top-0 pt-4 pb-2 bg-background-light dark:bg-background-dark z-10 flex justify-between items-center">
            <Link to="/" className="text-text-muted hover:text-primary transition-colors duration-200 flex items-center space-x-1">
              <ArrowLeft size={18} />
              <span>Home</span>
            </Link>
            
            {/* Mobile navigation to login */}
            <div className="lg:hidden">
              <Link to="/login" className="text-primary hover:text-primary-700 font-medium">
                Sign In
              </Link>
            </div>
          </div>
          
          <div className="flex-grow flex flex-col justify-center items-center py-8">
            <div className="w-full max-w-lg">
              <div className="flex justify-center mb-8">
                <Link to="/" className="inline-block">
                  <span className="sr-only">RideBooker</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon-3xl text-primary dark:text-primary-400"
                  >
                    <path d="M6 17L6 3" />
                    <path d="M18 17L18 3" />
                    <path d="M6 11L18 11" />
                    <path d="M6 17H18C19.1046 17 20 17.8954 20 19V21H4V19C4 17.8954 4.89543 17 6 17Z" />
                  </svg>
                </Link>
              </div>

              <RegisterForm />
            </div>
          </div>
        </div>
        
        {/* Bottom pattern decoration (visible only on mobile) */}
        <div className="lg:hidden h-8 bg-gradient-to-r from-primary-700 to-primary-900 relative overflow-hidden mt-auto">
          <div className="absolute inset-0 opacity-30 pattern-kente"></div>
        </div>
      </div>
      
      {/* Beautiful African-inspired background section */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-accent-green to-accent-blue order-1 lg:order-2">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-10 pattern-kente"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.1)_0%,transparent_60%)]"></div>
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full h-full px-12 text-text-inverse">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md"
          >
            <h1 className="text-4xl font-bold mb-6">Join Our Network</h1>
            <p className="text-xl text-accent-100 mb-8">Create your account today and start your journey with RideBooker.</p>
            
            <div className="mt-8 space-y-6">
              <div className="bg-white bg-opacity-10 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-accent-kente-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg italic mb-4">"RideBooker transformed my daily commute. Safe drivers, affordable prices, and the app is so easy to use!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent-yellow bg-opacity-30 rounded-full flex items-center justify-center text-accent-kente-gold font-bold">
                    CN
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Chinedu N.</h4>
                    <p className="text-sm text-primary-100">Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-4xl font-bold text-accent-kente-gold mb-2">500+</div>
                  <div className="text-center text-sm">Certified Drivers</div>
                </div>
                <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-4xl font-bold text-accent-kente-gold mb-2">20K+</div>
                  <div className="text-center text-sm">Monthly Rides</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* New: Login button on desktop view */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <Link to="/login" className="flex items-center text-white bg-accent-blue hover:bg-accent-blue-700 transition-colors px-6 py-3 rounded-lg shadow-lg">
              <span className="mr-2">Already have an account? Sign in</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;