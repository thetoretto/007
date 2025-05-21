import '../../index.css';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, UserPlus, Mail, Phone, User, Lock, FileCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

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
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
  }) => {
    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: 'passenger', // Default role for registration
      });
      navigate('/');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-base dark:text-text-inverse">Create Your Account</h2>
        <p className="mt-2 text-text-muted dark:text-primary-200">Join our community of travelers across Africa</p>
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
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            termsAccepted: false,
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="form-label mb-1.5 text-text-base dark:text-text-inverse">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <Field
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      className="form-input pl-10 py-2.5 w-full border border-primary-200 dark:border-primary-700 rounded-lg bg-background-light dark:bg-section-dark text-text-base dark:text-text-inverse focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                      disabled={loading}
                      placeholder="Your first name"
                    />
                  </div>
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="mt-1 text-sm text-error"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="form-label mb-1.5 text-text-base dark:text-text-inverse">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <Field
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      className="form-input pl-10 py-2.5 w-full border border-primary-200 dark:border-primary-700 rounded-lg bg-background-light dark:bg-section-dark text-text-base dark:text-text-inverse focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                      disabled={loading}
                      placeholder="Your last name"
                    />
                  </div>
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="mt-1 text-sm text-error"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="form-label mb-1.5 text-text-base dark:text-text-inverse">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={18} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="form-input pl-10 py-2.5 w-full border border-primary-200 dark:border-primary-700 rounded-lg bg-background-light dark:bg-section-dark text-text-base dark:text-text-inverse focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                    disabled={loading}
                    placeholder="your.email@example.com"
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="mt-1 text-sm text-error"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="form-label mb-1.5 text-text-base dark:text-text-inverse">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone size={18} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <Field
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    className="form-input pl-10 py-2.5 w-full border border-primary-200 dark:border-primary-700 rounded-lg bg-background-light dark:bg-section-dark text-text-base dark:text-text-inverse focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                    disabled={loading}
                    placeholder="+27 12 345 6789"
                  />
                </div>
                <p className="text-xs text-text-muted dark:text-primary-300 mt-1">
                  Include country code (e.g., +27 for South Africa)
                </p>
                <ErrorMessage
                  name="phoneNumber"
                  component="div"
                  className="mt-1 text-sm text-error"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="form-label mb-1.5 text-text-base dark:text-text-inverse">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="form-input pl-10 pr-10 py-2.5 w-full border border-primary-200 dark:border-primary-700 rounded-lg bg-background-light dark:bg-section-dark text-text-base dark:text-text-inverse focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                      disabled={loading}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
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

                <div>
                  <label htmlFor="confirmPassword" className="form-label mb-1.5 text-text-base dark:text-text-inverse">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="form-input pl-10 pr-10 py-2.5 w-full border border-primary-200 dark:border-primary-700 rounded-lg bg-background-light dark:bg-section-dark text-text-base dark:text-text-inverse focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                      disabled={loading}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="mt-1 text-sm text-error"
                  />
                </div>
              </div>

              <div className="bg-secondary-50 dark:bg-primary-900 dark:bg-opacity-20 p-4 rounded-lg border border-primary-100 dark:border-primary-800">
                <p className="text-sm font-medium text-text-base dark:text-primary-200 mb-2">
                  Password requirements:
                </p>
                <ul className="text-xs text-text-muted dark:text-primary-300 space-y-1">
                  <li className="flex items-center">
                    <FileCheck size={16} className="mr-1.5 text-primary-600 dark:text-primary-400" />
                    At least 8 characters
                  </li>
                  <li className="flex items-center">
                    <FileCheck size={16} className="mr-1.5 text-primary-600 dark:text-primary-400" />
                    At least one uppercase letter (A-Z)
                  </li>
                  <li className="flex items-center">
                    <FileCheck size={16} className="mr-1.5 text-primary-600 dark:text-primary-400" />
                    At least one lowercase letter (a-z)
                  </li>
                  <li className="flex items-center">
                    <FileCheck size={16} className="mr-1.5 text-primary-600 dark:text-primary-400" />
                    At least one number (0-9)
                  </li>
                </ul>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Field
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-primary-300 dark:border-primary-600 rounded transition-colors"
                    disabled={loading}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="termsAccepted" className="font-medium text-text-base dark:text-text-inverse">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary dark:text-primary-300 hover:text-primary-700 dark:hover:text-primary-200 hover:underline">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary dark:text-primary-300 hover:text-primary-700 dark:hover:text-primary-200 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                  <ErrorMessage
                    name="termsAccepted"
                    component="div"
                    className="mt-1 text-sm text-error"
                  />
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
                    <UserPlus size={18} />
                    <span>Create account</span>
                  </>
                )}
              </motion.button>
            </Form>
          )}
        </Formik>
      </div>
    </motion.div>
  );
};

export default RegisterForm;