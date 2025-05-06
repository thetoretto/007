import React from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import Navbar from '../../components/common/Navbar'; // Assuming Navbar is updated
import Footer from '../../components/common/Footer'; // Assuming Footer is updated

const LoginPage: React.FC = () => {
  const location = useLocation();
  const message = location.state?.message;
  const redirectTo = location.state?.from || '/'; // Get redirect path or default

  return (
    // Updated: Full page layout with min-height and background
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      {/* Updated: Main content area with padding and centering */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Optional: Add a heading or logo above the form */}
          {/* <div className="text-center">
            <img className="mx-auto h-12 w-auto" src="/logo.svg" alt="RideBooker" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          </div> */} 
          
          {/* Display message if redirected from a protected route */}
          {message && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* Optional: Add an icon */} 
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{message}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* LoginForm component (already styled) */}
          <LoginForm redirectTo={redirectTo} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;