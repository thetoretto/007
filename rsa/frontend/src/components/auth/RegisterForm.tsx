import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle, UserPlus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

interface RegisterFormProps {
  redirectTo?: string;
}

// Step 1: Personal Information
const step1Schema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

// Step 2: Contact & Security
const step2Schema = Yup.object({
  phoneNumber: Yup.string()
    .matches(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

// Step 3: Terms & Preferences
const step3Schema = Yup.object({
  termsAccepted: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

const RegisterForm: React.FC<RegisterFormProps> = ({ redirectTo }) => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const totalSteps = 3;

  const getStepSchema = (step: number) => {
    switch (step) {
      case 1: return step1Schema;
      case 2: return step2Schema;
      case 3: return step3Schema;
      default: return step1Schema;
    }
  };

  const handleNext = async (values: any) => {
    setFormData({ ...formData, ...values });
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (values: any) => {
    const finalData = { ...formData, ...values };
    try {
      await register(
        finalData.firstName,
        finalData.lastName,
        finalData.email,
        finalData.phoneNumber,
        finalData.password
      );

      // Navigate to the specified redirect path or dashboard
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is handled by the auth store
      console.error('Registration failed:', error);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-6">Personal Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  First Name
                </label>
                <div className="form-input-icon">
                  <Field
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    className="form-input"
                  />
                  <User size={16} className="icon" />
                </div>
                <ErrorMessage name="firstName" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Last Name
                </label>
                <div className="form-input-icon">
                  <Field
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    className="form-input"
                  />
                  <User size={16} className="icon" />
                </div>
                <ErrorMessage name="lastName" component="div" className="form-error" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email Address
              </label>
              <div className="form-input-icon">
                <Field
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="form-input"
                />
                <Mail size={16} className="icon" />
              </div>
              <ErrorMessage name="email" component="div" className="form-error" />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-6">Contact & Security</h3>

            <div className="form-group">
              <label className="form-label">
                <Phone size={16} />
                Phone Number
              </label>
              <div className="form-input-icon">
                <Field
                  name="phoneNumber"
                  type="tel"
                  placeholder="+27 12 345 6789"
                  className="form-input"
                />
                <Phone size={16} className="icon" />
              </div>
              <ErrorMessage name="phoneNumber" component="div" className="form-error" />
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +27 for South Africa)</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Password
              </label>
              <div className="form-input-icon">
                <Field
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="form-input"
                  style={{ paddingRight: '3rem' }}
                />
                <Lock size={16} className="icon" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <ErrorMessage name="password" component="div" className="form-error" />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Confirm Password
              </label>
              <div className="form-input-icon">
                <Field
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="form-input"
                  style={{ paddingRight: '3rem' }}
                />
                <Lock size={16} className="icon" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <ErrorMessage name="confirmPassword" component="div" className="form-error" />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-6">Terms & Conditions</h3>

            <div className="form-group">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Field
                  name="termsAccepted"
                  type="checkbox"
                  className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <label className="text-sm font-medium cursor-pointer">
                    I agree to the{' '}
                    <Link to="/terms" className="auth-link" target="_blank">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="auth-link" target="_blank">
                      Privacy Policy
                    </Link>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    By creating an account, you're joining a trusted community of travelers across Africa.
                  </p>
                </div>
              </div>
              <ErrorMessage name="termsAccepted" component="div" className="form-error" />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What's next?</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Verify your email address</li>
                <li>• Complete your profile</li>
                <li>• Start booking rides or become a driver</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-form animate-slide-in">
      {/* Error Display */}
      {error && (
        <div className="form-error animate-fade-in">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Step Indicator */}
      <div className="step-indicator">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`step-dot ${
              index + 1 < currentStep ? 'completed' :
              index + 1 === currentStep ? 'active' : ''
            }`}
          />
        ))}
      </div>

      <Formik
        initialValues={formData}
        validationSchema={getStepSchema(currentStep)}
        onSubmit={currentStep === totalSteps ? handleSubmit : handleNext}
        enableReinitialize
      >
        {({ values, isValid }) => (
          <Form>
            {renderStepContent(currentStep)}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
              )}

              <div className="ml-auto">
                {currentStep < totalSteps ? (
                  <button
                    type="submit"
                    disabled={!isValid}
                    className="auth-button flex items-center gap-2"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !isValid}
                    className="auth-button flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" color="white" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Create Account
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RegisterForm;