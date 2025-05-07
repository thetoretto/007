import '../../index.css';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, UserPlus } from 'lucide-react'; // Added UserPlus icon
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phoneNumber: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164 expected)')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  termsAccepted: Yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string; // Changed from phone
    password: string;
  }) => {
    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber, // Changed from phone
        password: values.password,
        role: 'passenger', // Default role for registration
      });
      navigate('/');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    // Updated: Removed max-width, added padding/border/shadow for consistency
    <div className="bg-white p-6 sm:p-8 border border-gray-200 rounded-lg shadow-sm w-full">
      {/* Updated: Heading style */}
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Create your account</h2>
      
      {error && (
        // Updated: Error message styling
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '', // Changed from phone
          password: '',
          confirmPassword: '',
          termsAccepted: false,
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, dirty }) => (
          // Updated: Spacing
          <Form className="space-y-5">
            {/* Updated: Grid layout for names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {/* Updated: Label style */}
                <label htmlFor="firstName" className="form-label">
                  First name
                </label>
                {/* Updated: Input style */}
                <Field
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  className="form-input"
                  disabled={loading}
                />
                {/* Updated: Error message style */}
                <ErrorMessage
                  name="firstName"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                {/* Updated: Label style */}
                <label htmlFor="lastName" className="form-label">
                  Last name
                </label>
                {/* Updated: Input style */}
                <Field
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  className="form-input"
                  disabled={loading}
                />
                {/* Updated: Error message style */}
                <ErrorMessage
                  name="lastName"
                  component="div"
                  className="form-error"
                />
              </div>
            </div>

            <div>
              {/* Updated: Label style */}
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              {/* Updated: Input style */}
              <Field
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="form-input"
                disabled={loading}
                placeholder="you@example.com"
              />
              {/* Updated: Error message style */}
              <ErrorMessage
                name="email"
                component="div"
                className="form-error"
              />
            </div>

            <div>
              {/* Updated: Label style */}
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number
              </label>
              {/* Updated: Input style */}
              <Field
                id="phoneNumber"
                name="phoneNumber"
                type="tel" // Use tel type for phone numbers
                autoComplete="tel"
                className="form-input"
                disabled={loading}
                placeholder="+1234567890"
              />
              {/* Updated: Error message style */}
              <ErrorMessage
                name="phoneNumber"
                component="div"
                className="form-error"
              />
            </div>

            <div>
              {/* Updated: Label style */}
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                {/* Updated: Input style */}
                <Field
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="form-input pr-10"
                  disabled={loading}
                  placeholder="Create a password"
                />
                {/* Updated: Button style */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
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
                className="form-error"
              />
            </div>

            <div>
              {/* Updated: Label style */}
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number
              </label>
              {/* Updated: Input style */}
              <Field
                id="phoneNumber"
                name="phoneNumber"
                type="tel" // Use tel type for phone numbers
                autoComplete="tel"
                className="form-input"
                disabled={loading}
                placeholder="+1234567890"
              />
              {/* Updated: Error message style */}
              <ErrorMessage
                name="phoneNumber"
                component="div"
                className="form-error"
              />
            </div>

            <div>
              {/* Updated: Label style */}
              <label htmlFor="confirmPassword" className="form-label">
                Confirm password
              </label>
              <div className="relative">
                {/* Updated: Input style */}
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="form-input pr-10"
                  disabled={loading}
                  placeholder="Confirm your password"
                />
                {/* Updated: Button style */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {/* Updated: Error message style */}
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="form-error"
              />
            </div>

            <div className="flex items-start">
              {/* Updated: Checkbox style */}
              <Field
                id="termsAccepted"
                name="termsAccepted"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
                disabled={loading}
              />
              <div className="ml-2">
                {/* Updated: Label style */}
                <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">Terms</Link> and{' '}
                  <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">Privacy Policy</Link>.
                </label>
                {/* Updated: Error message style */}
                <ErrorMessage
                  name="termsAccepted"
                  component="div"
                  className="form-error"
                />
              </div>
            </div>

            <div>
              {/* Updated: Button style and added icon */}
              <button
                type="submit"
                disabled={loading || !(isValid && dirty)}
                className={`btn btn-primary w-full ${ (loading || !(isValid && dirty)) ? 'opacity-50 cursor-not-allowed !bg-primary-600' : '' }`}
              >
                {loading ? <LoadingSpinner size="small" color="white" /> : <><UserPlus className="h-4 w-4 mr-2" /> Create account</>}
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
            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;