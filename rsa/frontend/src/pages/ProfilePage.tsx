import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { User, Edit3, Shield, Phone, Mail, LogOut, AlertTriangle, CheckCircle } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfileSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phoneNumber: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format (e.g., +1234567890)', excludeEmptyString: true })
    .nullable(),
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'), // In a real app, validate this against the backend
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm new password is required'),
});

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    updateUserProfile,
    changePassword,
    deactivateAccount,
    logout,
    loading,
    error,
  } = useAuthStore();

  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleProfileUpdate = async (values: { firstName: string; lastName: string; email: string; phoneNumber?: string }) => {
    if (!user) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateUserProfile(user.id, values);
      setSuccessMessage('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) {
      // Error is handled by the global error state in store
    }
  };

  const handlePasswordChange = async (values: { currentPassword: string, newPassword: string }) => {
    if (!user) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      // In a real app, you'd verify currentPassword on the backend first.
      // For this mock, we'll assume it's correct and proceed.
      await changePassword(user.id, values.newPassword);
      setSuccessMessage('Password changed successfully!');
      setShowPasswordForm(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) {
      // Error is handled by the global error state in store
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await deactivateAccount(user.id);
      setSuccessMessage('Account deactivated. You will be logged out.');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 3000);
    } catch (e) {
      // Error is handled by the global error state in store
    }
  };

  if (!user) {
    return <LoadingSpinner />; // Or a redirect component
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">Your Profile</h1>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" /> {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" /> {errorMessage}
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <User className="h-12 w-12 text-primary-600 mr-4" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-700">{user.firstName} {user.lastName}</h2>
              <p className="text-gray-500">{user.email}</p>
              {user.phoneNumber && <p className="text-gray-500">{user.phoneNumber}</p>}
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="ml-auto text-primary-600 hover:text-primary-700 flex items-center"
              >
                <Edit3 className="h-5 w-5 mr-1" /> Edit
              </button>
            )}
          </div>

          {editMode ? (
            <Formik
              initialValues={{
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber || '',
              }}
              validationSchema={ProfileSchema}
              onSubmit={handleProfileUpdate}
            >
              {() => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                    <Field name="firstName" type="text" className="mt-1 form-input w-full" />
                    <ErrorMessage name="firstName" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <Field name="lastName" type="text" className="mt-1 form-input w-full" />
                    <ErrorMessage name="lastName" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <Field name="email" type="email" className="mt-1 form-input w-full" />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                    <Field name="phoneNumber" type="tel" className="mt-1 form-input w-full" placeholder="+1234567890" />
                    <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full sm:w-auto flex items-center justify-center"
                    >
                      {loading ? <LoadingSpinner size="small" /> : <><CheckCircle className="h-5 w-5 mr-2" /> Save Changes</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      disabled={loading}
                      className="btn-secondary w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="space-y-3 text-gray-700">
              <p><Mail className="inline h-5 w-5 mr-2 text-gray-500" />Email: {user.email}</p>
              <p><Phone className="inline h-5 w-5 mr-2 text-gray-500" />Phone: {user.phoneNumber || 'Not set'}</p>
              <p>Role: <span className="capitalize">{user.role}</span></p>
              <p>Status: <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{user.status}</span></p>
            </div>
          )}

          <hr className="my-8" />

          <div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full text-left py-3 px-4 rounded-md hover:bg-gray-50 flex items-center text-gray-700 font-medium"
            >
              <Shield className="h-5 w-5 mr-3 text-primary-600" /> Change Password
            </button>
            {showPasswordForm && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50">
                <Formik
                  initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
                  validationSchema={PasswordSchema}
                  onSubmit={handlePasswordChange}
                >
                  {() => (
                    <Form className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                        <Field name="currentPassword" type="password" className="mt-1 form-input w-full" />
                        <ErrorMessage name="currentPassword" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                        <Field name="newPassword" type="password" className="mt-1 form-input w-full" />
                        <ErrorMessage name="newPassword" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <Field name="confirmPassword" type="password" className="mt-1 form-input w-full" />
                        <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div className="flex gap-4 pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary w-full sm:w-auto flex items-center justify-center"
                        >
                          {loading ? <LoadingSpinner size="small" /> : <><CheckCircle className="h-5 w-5 mr-2" /> Update Password</>}
                        </button>
                         <button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          disabled={loading}
                          className="btn-secondary w-full sm:w-auto"
                        >
                          Cancel
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            )}
          </div>

          <hr className="my-8" />

          <div>
            <button
              onClick={() => setShowDeactivateConfirm(true)}
              className="w-full text-left py-3 px-4 rounded-md hover:bg-red-50 flex items-center text-red-600 font-medium"
            >
              <LogOut className="h-5 w-5 mr-3" /> Deactivate Account
            </button>
            {showDeactivateConfirm && (
              <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
                <p className="text-sm text-red-700 mb-4">Are you sure you want to deactivate your account? This action cannot be undone immediately.</p>
                <div className="flex gap-4">
                  <button
                    onClick={handleDeactivate}
                    disabled={loading}
                    className="btn-danger w-full sm:w-auto flex items-center justify-center"
                  >
                    {loading ? <LoadingSpinner size="small" color="white" /> : <><AlertTriangle className="h-5 w-5 mr-2" /> Yes, Deactivate</>}
                  </button>
                  <button
                    onClick={() => setShowDeactivateConfirm(false)}
                    disabled={loading}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;