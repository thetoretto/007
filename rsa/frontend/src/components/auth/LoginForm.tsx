import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

interface LoginFormProps {
  redirectTo?: string;
}

const validationSchema = Yup.object({
  emailOrPhone: Yup.string()
    .required('Email or phone number is required')
    .test('email-or-phone', 'Please enter a valid email or phone number', function(value) {
      if (!value) return false;

      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) return true;

      // Check if it's a valid phone number (basic validation)
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      return phoneRegex.test(value);
    }),
  password: Yup.string().required('Password is required'),
});

const LoginForm: React.FC<LoginFormProps> = ({ redirectTo }) => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values: { emailOrPhone: string; password: string; rememberMe: boolean }) => {
    try {
      // Pass the credentials as an object, not individual parameters
      await login({
        emailOrPhone: values.emailOrPhone,
        password: values.password,
        rememberMe: values.rememberMe
      });

      // Navigate to the specified redirect path or dashboard
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is handled by the auth store
      console.error('Login failed:', error);
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

      <Formik
        initialValues={{
          emailOrPhone: '',
          password: '',
          rememberMe: false,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            {/* Email/Phone Field */}
            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email or Phone
              </label>
              <div className="form-input-icon">
                <Field
                  name="emailOrPhone"
                  type="text"
                  placeholder="Enter your email or phone number"
                  className="form-input"
                />
                <Mail size={16} className="icon" />
              </div>
              <ErrorMessage name="emailOrPhone" component="div" className="form-error" />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Password
              </label>
              <div className="form-input-icon">
                <Field
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <Field
                  name="rememberMe"
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="auth-link text-sm">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-button w-full"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" color="white" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">Don't have an account? </span>
              <Link to="/register" className="auth-link">
                Create one
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;