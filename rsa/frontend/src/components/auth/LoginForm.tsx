import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, LogIn } from 'lucide-react'; // Added LogIn icon
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

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

const LoginForm: React.FC<LoginFormProps> = ({ redirectTo }) => { // Removed default redirectTo
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
      // User object should be updated in the store after login
      // We access the updated user from the store directly
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
            navigate(redirectTo || '/'); // Default to '/' or provided redirectTo for passengers
            break;
          default:
            navigate(redirectTo || '/'); // Fallback to default
        }
      } else {
        // Fallback if user is not available for some reason
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
    // Updated: Removed max-width, added padding/border/shadow for consistency with page layout
    <div className="bg-white p-6 sm:p-8 border border-gray-200 rounded-lg shadow-sm w-full">
      {/* Updated: Heading style */}
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Log in to your account</h2>
      
      {error && (
        // Updated: Error message styling
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <Formik
        initialValues={{ emailOrPhone: '', password: '', rememberMe: false }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, dirty }) => (
          // Updated: Spacing
          <Form className="space-y-5">
            <div>
              {/* Updated: Label style */}
              <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Phone Number
              </label>
              {/* Updated: Input style */}
              <Field
                id="emailOrPhone"
                name="emailOrPhone"
                type="text" // Changed to text to allow phone numbers
                autoComplete="username" // More general for email or phone
                className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                disabled={loading}
                placeholder="you@example.com or +1234567890"
              />
              {/* Updated: Error message style */}
              <ErrorMessage
                name="emailOrPhone"
                component="div"
                className="mt-1 text-xs text-red-600"
              />
            </div>

            <div>
              {/* Updated: Label style */}
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                {/* Updated: Input style */}
                <Field
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out pr-10"
                  disabled={loading}
                  placeholder="Enter your password"
                />
                {/* Updated: Button style */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {/* Updated: Error message style */}
              <ErrorMessage
                name="password"
                component="div"
                className="mt-1 text-xs text-red-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* Updated: Checkbox style */}
                <Field
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={loading}
                />
                {/* Updated: Label style */}
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                {/* Updated: Link style */}
                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              {/* Updated: Button style and added icon */}
              <button
                type="submit"
                disabled={loading || !(isValid && dirty)}
                className={`w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out ${ 
                  loading || !(isValid && dirty)
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {loading ? <LoadingSpinner size="small" color="white" /> : <><LogIn className="h-4 w-4 mr-2" /> Sign in</>}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {/* Updated: Divider and link styles */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;