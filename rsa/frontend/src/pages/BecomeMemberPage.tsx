import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import {
  User,
  MapPin,
  FileText,
  Users,
  DollarSign,
  Clock,
  ShieldCheck,
  Car,
  CarFront,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

import '../index.css';

const BecomeMemberPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    drivingLicense: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleYear: '',
    sex: '',
    experience: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email?.trim()) newErrors.email = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.location.trim()) newErrors.location = "Location is required";
      if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    } else if (stepNumber === 2) {
      if (!formData.drivingLicense.trim()) newErrors.drivingLicense = "License number is required";
      if (!formData.vehicleType) newErrors.vehicleType = "Vehicle type is required";
      if (!formData.vehicleMake.trim()) newErrors.vehicleMake = "Vehicle make is required";
      if (!formData.vehicleYear.trim()) newErrors.vehicleYear = "Vehicle year is required";
      else if (!/^\d{4}$/.test(formData.vehicleYear)) newErrors.vehicleYear = "Enter a valid 4-digit year";
      if (!formData.experience) newErrors.experience = "Please select your experience level";
      if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateStep(step)) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form Data Submitted:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="w-full">
      <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-light-primary dark:text-dark-primary tracking-tight mb-4">
              Become a Driver Partner
            </h1>
            <p className="mt-2 text-lg text-light-secondary dark:text-primary-medium max-w-2xl mx-auto">
              Register your vehicle and start earning with every ride. Complete your driver profile
              to get approved within 24 hours.
            </p>
          </motion.div>

          {/* Progress Steps */}
          {!isSubmitted && (
            <motion.div variants={fadeInUp} className="mb-10">
              <div className="flex justify-between max-w-md mx-auto">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                    step >= 1 ? 'bg-primary text-black dark:bg-primary-medium' : 'bg-surface-light dark:bg-surface-dark text-light-tertiary'
                  }`}>
                    1
                  </div>
                  <span className={`mt-2 text-sm ${step >= 1 ? 'text-light-primary dark:text-dark-primary' : 'text-light-tertiary'}`}>
                    Personal Details
                  </span>
                </div>
                <div className="flex-1 flex items-center">
                  <div className={`h-1 w-full ${step >= 2 ? 'bg-primary dark:bg-primary-medium' : 'bg-surface-light dark:bg-surface-dark'}`}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                    step >= 2 ? 'bg-primary text-black dark:bg-primary-medium' : 'bg-surface-light dark:bg-surface-dark text-light-tertiary'
                  }`}>
                    2
                  </div>
                  <span className={`mt-2 text-sm ${step >= 2 ? 'text-light-primary dark:text-dark-primary' : 'text-light-tertiary'}`}>
                    Vehicle Info
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeInUp} className="grid md:grid-cols-5 gap-8">
            {/* Form Container */}
            <div className="md:col-span-3">
              {isSubmitted ? (
                <motion.div
                  className="card p-8 text-center py-16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle className="h-20 w-20 text-secondary mx-auto mb-6" />
                  <h2 className="text-2xl font-semibold text-light-primary dark:text-dark-primary mb-4">Registration Successful!</h2>
                  <p className="text-light-secondary dark:text-primary-medium mb-8 max-w-md mx-auto">
                    Thank you for joining our driver network. We'll review your details and get back to you within 24 hours.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={() => window.location.href = '/'}
                      className="btn btn-secondary"
                    >
                      Back to Home
                    </button>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="btn btn-primary"
                    >
                      Sign In
                    </button>
                  </div>
                  </motion.div>
              ) : (
                <div className="card p-8">
                  {step === 1 && (
                    <div>
                      <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary mb-6">
                        Personal Information
                      </h2>
                      <form className="space-y-6">
                  <div>
                          <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                          <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-light-tertiary dark:text-primary-medium" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                              className={`form-input pl-10 ${errors.name ? 'border-error' : ''}`}
                        placeholder="e.g., John Doe"
                      />
                    </div>
                          {errors.name && <p className="form-error">{errors.name}</p>}
                        </div>

                        <div>
                          <label htmlFor="email" className="form-label">
                            Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-text-muted dark:text-primary-200" />
                            </div>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`form-input pl-10 ${errors.email ? 'border-error' : ''}`}
                              placeholder="e.g., johndoe@example.com"
                            />
                          </div>
                          {errors.email && <p className="form-error">{errors.email}</p>}
                        </div>

                        <div>
                          <label htmlFor="phone" className="form-label">
                            Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-5 w-5 text-text-muted dark:text-primary-200" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className={`form-input pl-10 ${errors.phone ? 'border-error' : ''}`}
                              placeholder="e.g., +1 (555) 123-4567"
                            />
                          </div>
                          {errors.phone && <p className="form-error">{errors.phone}</p>}
                  </div>

                  <div>
                          <label htmlFor="location" className="form-label">
                      Location (City/Area)
                    </label>
                          <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MapPin className="h-5 w-5 text-text-muted dark:text-primary-200" />
                      </div>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={formData.location}
                        onChange={handleChange}
                              className={`form-input pl-10 ${errors.location ? 'border-error' : ''}`}
                        placeholder="e.g., New York City"
                      />
                          </div>
                          {errors.location && <p className="form-error">{errors.location}</p>}
                        </div>

                        <div className="flex justify-end mt-6">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNextStep}
                            className="btn btn-primary w-full sm:w-auto flex items-center justify-center"
                          >
                            Next Step <ArrowRight className="ml-2 h-4 w-4" />
                          </motion.button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {step === 2 && (
                    <div>
                      <h2 className="text-xl font-semibold text-text-base dark:text-text-inverse mb-6">
                        Vehicle Information
                      </h2>
                      <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                          <label htmlFor="drivingLicense" className="form-label">
                      Driving License Number
                    </label>
                          <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FileText className="h-5 w-5 text-text-muted dark:text-primary-200" />
                      </div>
                      <input
                        type="text"
                        name="drivingLicense"
                        id="drivingLicense"
                        value={formData.drivingLicense}
                        onChange={handleChange}
                              className={`form-input pl-10 ${errors.drivingLicense ? 'border-error' : ''}`}
                        placeholder="e.g., X123456789"
                      />
                    </div>
                          {errors.drivingLicense && <p className="form-error">{errors.drivingLicense}</p>}
                  </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                            <label htmlFor="vehicleType" className="form-label">
                      Vehicle Type
                    </label>
                            <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Car className="h-5 w-5 text-text-muted dark:text-primary-200" />
                      </div>
                      <select
                        name="vehicleType"
                        id="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                                className={`form-input pl-10 pr-10 ${errors.vehicleType ? 'border-error' : ''}`}
                      >
                        <option value="" disabled>Select vehicle type</option>
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="van">Van</option>
                        <option value="truck">Truck</option>
                      </select>
                    </div>
                            {errors.vehicleType && <p className="form-error">{errors.vehicleType}</p>}
                  </div>

                  <div>
                            <label htmlFor="sex" className="form-label">
                              Gender
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Users className="h-5 w-5 text-text-muted dark:text-primary-200" />
                              </div>
                              <select
                                name="sex"
                                id="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                className="form-input pl-10 pr-10"
                              >
                                <option value="" disabled>Select your gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="vehicleMake" className="form-label">
                      Vehicle Make
                    </label>
                            <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CarFront className="h-5 w-5 text-text-muted dark:text-primary-200" />
                      </div>
                      <input
                        type="text"
                        name="vehicleMake"
                        id="vehicleMake"
                        value={formData.vehicleMake}
                        onChange={handleChange}
                                className={`form-input pl-10 ${errors.vehicleMake ? 'border-error' : ''}`}
                        placeholder="e.g., Toyota"
                      />
                    </div>
                            {errors.vehicleMake && <p className="form-error">{errors.vehicleMake}</p>}
                  </div>

                  <div>
                            <label htmlFor="vehicleYear" className="form-label">
                      Vehicle Year
                    </label>
                            <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-text-muted dark:text-primary-200" />
                      </div>
                      <input
                        type="text"
                        name="vehicleYear"
                        id="vehicleYear"
                        value={formData.vehicleYear}
                        onChange={handleChange}
                                className={`form-input pl-10 ${errors.vehicleYear ? 'border-error' : ''}`}
                        placeholder="e.g., 2020"
                      />
                            </div>
                            {errors.vehicleYear && <p className="form-error">{errors.vehicleYear}</p>}
                    </div>
                  </div>

                  <div>
                          <label htmlFor="experience" className="form-label">
                            Driving Experience
                    </label>
                          <div className="relative">
                      <select
                              name="experience"
                              id="experience"
                              value={formData.experience}
                        onChange={handleChange}
                              className={`form-input pr-10 ${errors.experience ? 'border-error' : ''}`}
                            >
                              <option value="" disabled>Select your experience</option>
                              <option value="1-2">1-2 years</option>
                              <option value="3-5">3-5 years</option>
                              <option value="5-10">5-10 years</option>
                              <option value="10+">10+ years</option>
                      </select>
                    </div>
                          {errors.experience && <p className="form-error">{errors.experience}</p>}
                        </div>

                        <div className="mt-4">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="agreeTerms"
                                name="agreeTerms"
                                type="checkbox"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                                className="form-checkbox"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="agreeTerms" className="font-medium text-text-base dark:text-text-inverse">
                                I agree to the
                                <a href="/terms" className="text-primary dark:text-primary-200 hover:underline"> Terms of Service</a>
                                {' '}and{' '}
                                <a href="/privacy" className="text-primary dark:text-primary-200 hover:underline">Privacy Policy</a>
                              </label>
                            </div>
                          </div>
                          {errors.agreeTerms && <p className="form-error mt-1">{errors.agreeTerms}</p>}
                  </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePrevStep}
                            className="btn btn-secondary flex items-center justify-center"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                          </motion.button>
                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                            className="btn btn-primary flex items-center justify-center"
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              'Register as a Driver'
                            )}
                    </motion.button>
                  </div>
                </form>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Benefits Section */}
            <div className="md:col-span-2 space-y-6">
              <div className="card p-6 rounded-xl border border-primary-100 dark:border-primary-800 bg-background-light dark:bg-section-dark shadow">
                <h3 className="text-xl font-semibold text-text-base dark:text-text-inverse mb-4">Driver Benefits</h3>
                <div className="space-y-5">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                      <DollarSign className="h-5 w-5 text-primary dark:text-primary-200" />
                    </div>
                    <div>
                      <h4 className="font-medium text-text-base dark:text-text-inverse">Earn Extra Income</h4>
                      <p className="text-sm text-text-muted dark:text-primary-200">Turn empty seats into earnings on your regular routes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-accent-yellow bg-opacity-20 dark:bg-accent-yellow dark:bg-opacity-20 p-3 rounded-lg">
                      <Clock className="h-5 w-5 text-accent-yellow dark:text-accent-kente-gold" />
                    </div>
                    <div>
                      <h4 className="font-medium text-text-base dark:text-text-inverse">Flexible Schedule</h4>
                      <p className="text-sm text-text-muted dark:text-primary-200">Drive whenever it suits you, no fixed hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-success bg-opacity-20 dark:bg-success dark:bg-opacity-20 p-3 rounded-lg">
                      <ShieldCheck className="h-5 w-5 text-success dark:text-success" />
                    </div>
                    <div>
                      <h4 className="font-medium text-text-base dark:text-text-inverse">Verified Riders</h4>
                      <p className="text-sm text-text-muted dark:text-primary-200">Share rides with trusted community members</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card p-6 rounded-xl border border-primary-100 dark:border-primary-800 bg-section-light dark:bg-background-dark shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 -mt-10 -mr-10 bg-primary bg-opacity-10 dark:bg-primary-800 dark:bg-opacity-20 rounded-full"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-text-base dark:text-text-inverse mb-3">Already a driver?</h3>
                  <p className="text-sm text-text-muted dark:text-primary-200 mb-4">
                    Sign in to your account to manage your profile, view ride requests, and track your earnings.
                  </p>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary w-full"
                      >
                  <a href="/login" className="inline-flex items-center ">
                    Sign In to Your Account
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </a>
                      </button>
                </div>
              </div>
              
              <div className="card p-6 rounded-xl border border-primary-100 dark:border-primary-800 bg-gradient-to-br from-primary-600 to-primary-900 text-text-inverse shadow relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pattern-kente"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-3">Top-Rated Drivers</h3>
                  <p className="text-sm text-primary-100 mb-4">
                    Our top drivers earn up to 30% more and get priority access to premium ride requests.
                  </p>
                  <div className="bg-white bg-opacity-20 dark:bg-black dark:bg-opacity-20 p-3 rounded-lg mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Monthly Earnings</span>
                      <span className="text-lg font-semibold">$1,200+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default BecomeMemberPage;