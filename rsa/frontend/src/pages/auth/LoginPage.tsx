import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn } from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm';
import useAuthStore from '../../store/authStore';

const LoginPage: React.FC = () => {
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
      <div className="absolute top-4 left-4">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <ArrowLeft size={16} />
          <span>Home</span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <LogIn size={24} className="text-white" />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to your GIGI move account and continue your journey.
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Register Link */}
        <div className="auth-divider">
          <span>New to GIGI move?</span>
        </div>

        <div className="text-center">
          <Link to="/register" className="auth-link">
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
