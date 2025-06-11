import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { User as UserIcon, Edit3, Shield, Phone, Mail, LogOut, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../../index.css';

const LoadingSpinner: React.FC<{ size?: 'small' | 'medium' | 'large', color?: string, className?: string }> = ({ size = 'medium', color, className = '' }) => {
  let sizeClass = 'loading-md';
  if (size === 'small') sizeClass = 'loading-sm';
  if (size === 'large') sizeClass = 'loading-lg';
  const colorClass = color ? `text-${color}` : 'text-primary';
  return <span className={`loading loading-spinner ${sizeClass} ${colorClass} ${className}`}></span>;
};

const ProfileSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phoneNumber: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number (e.g., +1234567890)', excludeEmptyString: true })
    .nullable(),
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
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
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      const timer = setTimeout(() => { setErrorMessage(null); useAuthStore.setState({ error: null }); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  useEffect(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, [editMode, showPasswordForm, showDeactivateConfirm]);

  const handleProfileUpdate = async (values: { firstName: string; lastName: string; email: string; phoneNumber?: string | null }) => {
    if (!user) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateUserProfile(user.id, values);
      setSuccessMessage('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) { /* error handled by global state */ }
  };

  const handlePasswordChange = async (values: { currentPassword: string, newPassword: string }, { resetForm }: any) => {
    if (!user) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await changePassword(user.id, values.currentPassword, values.newPassword);
      setSuccessMessage('Password changed successfully!');
      setShowPasswordForm(false);
      resetForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) { /* error handled by global state */ }
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
        navigate('/login', { replace: true });
      }, 3000);
    } catch (e) { /* error handled by global state */ }
  };

  if (loading && !user) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center transition-colors duration-300">
            <LoadingSpinner size="large" />
        </div>
    );
  }

  if (!user) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary transition-colors duration-300">
      <main className="container-app py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex-1 min-w-0 mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-text-light-primary dark:text-text-dark-primary transition-colors duration-300">Your Profile</h1>
            <p className="mt-1 text-sm text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-300">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {successMessage && (
          <div role="alert" className="flex items-center p-4 mb-6 text-green-800 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900 dark:text-green-200 dark:border-green-800 max-w-4xl mx-auto transition-colors duration-300">
            <CheckCircle size={20} className="mr-3 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div role="alert" className="flex items-center p-4 mb-6 text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800 max-w-4xl mx-auto transition-colors duration-300">
            <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto transition-colors duration-300">
          <div className="flex flex-col sm:flex-row items-center mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 text-2xl sm:text-3xl font-bold border-2 border-primary-200 dark:border-primary-700">
                    {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                </div>
            </div>
            <div className="text-center sm:text-left flex-grow">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-light-primary dark:text-text-dark-primary transition-colors duration-300">{user.firstName} {user.lastName}</h2>
              <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1 transition-colors duration-300">{user.email}</p>
              {user.phoneNumber && <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm transition-colors duration-300">{user.phoneNumber}</p>}
            </div>
            {!editMode && (
              <button
                onClick={() => { setEditMode(true); setShowPasswordForm(false); setShowDeactivateConfirm(false); }}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 mt-4 sm:mt-0 sm:ml-auto"
              >
                <Edit3 size={16} /> Edit Profile
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
              enableReinitialize
            >
              {({ dirty, isValid }) => (
                <Form className="space-y-5">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-1 transition-colors duration-300">First Name</label>
                    <Field name="firstName" type="text" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300" />
                    <ErrorMessage name="firstName" component="div" className="text-red-600 dark:text-red-400 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-1 transition-colors duration-300">Last Name</label>
                    <Field name="lastName" type="text" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300" />
                    <ErrorMessage name="lastName" component="div" className="text-red-600 dark:text-red-400 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-1 transition-colors duration-300">Email Address</label>
                    <Field name="email" type="email" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300" />
                    <ErrorMessage name="email" component="div" className="text-red-600 dark:text-red-400 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-1 transition-colors duration-300">Phone Number (Optional)</label>
                    <Field name="phoneNumber" type="tel" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300" placeholder="+1234567890" />
                    <ErrorMessage name="phoneNumber" component="div" className="text-red-600 dark:text-red-400 text-xs mt-1" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading || !dirty || !isValid}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2 w-full sm:flex-1"
                    >
                      {loading ? <LoadingSpinner size="small" /> : <Save size={18} />} Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors duration-300 w-full sm:flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="space-y-3 text-text-base dark:text-text-inverse mb-8 animate-fadeIn">
              <p className="flex items-center"><Mail size={18} className="mr-3 text-text-muted dark:text-text-muted-dark" />Email: {user.email}</p>
              <p className="flex items-center"><Phone size={18} className="mr-3 text-text-muted dark:text-text-muted-dark" />Phone: {user.phoneNumber || <span className="italic text-text-muted dark:text-text-muted-dark">Not set</span>}</p>
              <p className="flex items-center"><UserIcon size={18} className="mr-3 text-text-muted dark:text-text-muted-dark" />Role: <span className="badge badge-neutral capitalize">{user.role}</span></p>
              <p className="flex items-center">Status: 
                <span className={`badge capitalize ml-2 ${user.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{user.status}</span>
              </p>
            </div>
          )}

          <div className="divider my-6"></div>

          <div className="space-y-2">
            <button
              onClick={() => { setShowPasswordForm(!showPasswordForm); setEditMode(false); setShowDeactivateConfirm(false); }}
              className={`btn btn-outline w-full justify-start flex items-center gap-3 ${showPasswordForm ? 'btn-active btn-secondary' : 'hover:bg-base-200 dark:hover:bg-section-medium'}`}
            >
              <Shield size={18} className={`${showPasswordForm ? 'text-secondary-content' : 'text-primary dark:text-primary-300'}`} /> Change Password
            </button>
            {showPasswordForm && (
              <div className="mt-4 p-4 sm:p-6 border border-border dark:border-border-dark rounded-lg bg-base-200 dark:bg-section-medium animate-fadeIn">
                <h3 class="text-lg font-semibold mb-4 text-text-base dark:text-text-inverse">Set New Password</h3>
                <Formik
                  initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
                  validationSchema={PasswordSchema}
                  onSubmit={handlePasswordChange}
                >
                  {({ dirty, isValid }) => (
                    <Form className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="label-text font-medium">Current Password</label>
                        <Field name="currentPassword" type="password" className="input input-bordered w-full mt-1" />
                        <ErrorMessage name="currentPassword" component="div" className="text-error text-xs mt-1" />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="label-text font-medium">New Password</label>
                        <Field name="newPassword" type="password" className="input input-bordered w-full mt-1" />
                        <ErrorMessage name="newPassword" component="div" className="text-error text-xs mt-1" />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="label-text font-medium">Confirm New Password</label>
                        <Field name="confirmPassword" type="password" className="input input-bordered w-full mt-1" />
                        <ErrorMessage name="confirmPassword" component="div" className="text-error text-xs mt-1" />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 pt-3">
                        <button
                          type="submit"
                          disabled={loading || !dirty || !isValid}
                          className="btn btn-secondary w-full sm:flex-1 flex items-center justify-center gap-2"
                        >
                          {loading ? <LoadingSpinner size="small" /> : <Save size={18} />} Update Password
                        </button>
                         <button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          disabled={loading}
                          className="btn btn-ghost w-full sm:flex-1"
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

          <div className="divider my-6"></div>

          <div>
            <button
              onClick={() => { setShowDeactivateConfirm(true); setEditMode(false); setShowPasswordForm(false);}}
              className="btn btn-outline btn-error w-full justify-start flex items-center gap-3 hover:bg-error-soft dark:hover:bg-error-soft"
            >
              <LogOut size={18} /> Deactivate Account
            </button>
            {showDeactivateConfirm && (
              <div className="mt-4 p-4 border border-error/50 rounded-lg bg-error-soft dark:bg-error-soft animate-fadeIn">
                <div className="flex items-start">
                    <AlertTriangle size={24} className="text-error mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-md font-semibold text-error mb-1">Confirm Deactivation</h3>
                        <p className="text-sm text-error/80 dark:text-error/70 mb-4">Are you sure you want to deactivate your account? This action will log you out and cannot be undone through this interface.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={handleDeactivate}
                    disabled={loading}
                    className="btn btn-error w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {loading ? <LoadingSpinner size="small" color="white" /> : <AlertTriangle size={18} />} Yes, Deactivate
                  </button>
                  <button
                    onClick={() => setShowDeactivateConfirm(false)}
                    disabled={loading}
                    className="btn btn-ghost w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;