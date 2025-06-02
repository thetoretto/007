import '../../index.css';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, LogIn, User, Lock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

interface LoginFormProps {
  redirectTo?: string;
}

const LoginSchema = Yup.object().shape({
  emailOrPhone: Yup.string()
    .required('Email or Phone Number is required')
    .test('emailOrPhone', 'Invalid email or phone number format', value => {
      if (!value) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
      return emailRegex.test(value) || phoneRegex.test(value);
    }),
  password: Yup.string().required('Password is required'),
});

const LoginForm: React.FC<LoginFormProps> = ({ redirectTo }) => {
  const navigate = useNavigate();
  const { login, loading, error, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values: { emailOrPhone: string; password: string; rememberMe: boolean }) => {
    try {
      await login({
        emailOrPhone: values.emailOrPhone,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      
      const loggedInUser = useAuthStore.getState().user;
      if (loggedInUser) {
        switch (loggedInUser.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'driver':
            navigate('/driver/dashboard');
            break;
          case 'passenger':
            navigate(redirectTo || '/passenger/dashboard');
            break;
          default:
            navigate(redirectTo || '/');
        }
      } else {
        navigate(redirectTo || '/');
      }
    } catch (error) {
      // Error is handled by the store
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-base dark:text-text-inverse">Welcome Back</h2>
        <p className="mt-2 text-text-muted dark:text-primary-200">Log in to continue your journey</p>
      </div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="alert alert-danger mb-6 p-4 rounded-lg border border-error bg-error bg-opacity-10 text-error flex items-start"
        >
          <div className="flex-shrink-0 mr-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <span>{error}</span>
        </motion.div>
      )}
      
      <div className="card p-6 sm:p-8 border border-primary-100 dark:border-primary-800 bg-background-light dark:bg-section-dark rounded-xl shadow-sm">
        <Formik
          initialValues={{ emailOrPhone: '', password: '', rememberMe: false }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="emailOrPhone" className="form-label mb-1.5 text-text-base dark:text-text-inverse">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <Field
                    id="emailOrPhone"
                    name="emailOrPhone"
                    type="text"
                    autoComplete="username"
                    className="form-input pl-10 py-2.5 w-full border border-primary-200 dark:border-primary-700 bg-background-light focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                    disabled={loading}
                    placeholder="Enter your email or phone"
                  />
                </div>
                <ErrorMessage
                  name="emailOrPhone"
                  component="div"
                  className="mt-1 text-sm text-error"
                />
              </div>

              <div>
                <label htmlFor="password" className="form-label mb-1.5 text-text-base dark:text-text-inverse">
                  Password
                </label>
                <div className="relative">
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="form-input pl-10 pr-10 py-2.5 w-full border border-primary-200 dark:border-primary-700 bg-background-light focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                    disabled={loading}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="mt-1 text-sm text-error"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Field
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-primary-300 dark:border-primary-600 rounded transition-colors"
                    disabled={loading}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-text-base dark:text-primary-200">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || !(isValid && dirty)}
                className="btn btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-base font-medium"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign in</span>
                  </>
                )}
              </motion.button>
            </Form>
          )}
        </Formik>
        
        <div className="mt-6 pt-6 border-t border-primary-100 dark:border-primary-800 text-center">
          <p className="text-xs text-text-muted dark:text-primary-300">
            By continuing, you agree to our <Link to="/terms" className="underline hover:text-primary dark:hover:text-primary-200">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-primary dark:hover:text-primary-200">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;