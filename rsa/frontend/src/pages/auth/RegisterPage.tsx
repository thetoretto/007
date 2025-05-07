import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm';
import Footer from '../../components/common/Footer'; // Assuming Footer is updated
import '../../index.css';

const RegisterPage: React.FC = () => {
  return (
    // Updated: Full page layout with min-height and background
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Updated: Main content area with padding and centering */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8"> {/* Increased max-width for register form */}
          {/* Optional: Add a heading or logo above the form */}
          {/* <div className="text-center">
            <img className="mx-auto h-12 w-auto" src="/logo.svg" alt="RideBooker" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          </div> */} 
          
          {/* RegisterForm component (already styled) */}
          <RegisterForm />
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;