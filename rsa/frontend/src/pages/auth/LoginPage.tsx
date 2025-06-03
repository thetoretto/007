import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import '../../index.css';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Logo from '../../components/common/Logo';

const LoginPage: React.FC = () => {
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
      {/* Beautiful African-inspired background section */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-800 to-primary-900">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-10 pattern-kente"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1)_0%,transparent_60%)]"></div>
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full h-full px-12 text-text-inverse">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md"
          >
            <h1 className="text-4xl font-bold mb-6">Welcome to RideBooker</h1>
            <p className="text-xl text-primary-100 mb-8">Connect with riders and drivers across Africa for safe, affordable transportation.</p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-700 bg-opacity-30 rounded-full p-2 mt-1">
                  <svg className="w-5 h-5 text-accent-kente-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Safe and Reliable</h3>
                  <p className="text-primary-100">All drivers are verified and rides are tracked</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary-700 bg-opacity-30 rounded-full p-2 mt-1">
                  <svg className="w-5 h-5 text-accent-kente-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Affordable Pricing</h3>
                  <p className="text-primary-100">Competitive rates with transparent pricing</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary-700 bg-opacity-30 rounded-full p-2 mt-1">
                  <svg className="w-5 h-5 text-accent-kente-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Community Focused</h3>
                  <p className="text-primary-100">Built by Africans, for Africans</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* New: Register button on desktop view */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <Link to="/register" className="flex items-center text-white bg-primary-700 hover:bg-primary-600 transition-colors px-6 py-3 rounded-lg shadow-lg">
              <span className="mr-2">Create a new account</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Form section - fixed position with overflow scroll */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background-light dark:bg-background-dark h-full">
        <div className="flex-grow flex flex-col px-4 sm:px-6 lg:px-8 relative overflow-y-auto">
          {/* Navigation header - fixed within this section */}
          <div className="sticky top-0 pt-4 pb-2 bg-background-light dark:bg-background-dark z-10 flex justify-between items-center">
            <Link to="/" className="text-text-muted hover:text-primary transition-colors duration-200 flex items-center space-x-1">
              <ArrowLeft size={18} />
              <span>Home</span>
            </Link>
            
            {/* Mobile navigation to register */}
            <div className="lg:hidden">
              <Link to="/register" className="text-primary hover:text-primary-700 font-medium">
                Create Account
              </Link>
            </div>
          </div>
          
          <div className="flex-grow flex flex-col justify-center items-center py-8">
            <div className="w-full max-w-md">
              <div className="flex justify-center mb-8">
                <Link to="/" className="inline-block">
                  <Logo 
                    variant="primary"
                    size="xl"
                    showText={true}
                    className=""
                  />
                </Link>
              </div>

        <LoginForm />
            </div>
          </div>
        </div>
        
        {/* Bottom pattern decoration (visible only on mobile) */}
        <div className="lg:hidden h-8 bg-gradient-to-r from-primary-700 to-primary-900 relative overflow-hidden mt-auto">
          <div className="absolute inset-0 opacity-30 pattern-kente"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;