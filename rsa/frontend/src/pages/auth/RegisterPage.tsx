import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import RegisterForm from '../../components/auth/RegisterForm';
import useAuthStore from '../../store/authStore';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Don't render the page if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="auth-container">
      {/* Navigation */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2.5 bg-surface-light dark:bg-surface-dark rounded-xl text-text-light-primary dark:text-text-dark-primary hover:bg-surface-light-alt dark:hover:bg-surface-dark-alt transition-all duration-300 shadow-sm hover:shadow-md border border-light dark:border-dark"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">Home</span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo shadow-lg">
            <UserPlus size={24} className="text-black" />
          </div>
          <h1 className="auth-title">Join GIGI move</h1>
          <p className="auth-subtitle">
            Create your account and become part of our trusted travel community.
          </p>
        </div>

        {/* Register Form */}
        <RegisterForm />

        {/* Login Link */}
        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>

        <div className="text-center">
          <Link to="/login" className="auth-link">
            Sign in to your account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;