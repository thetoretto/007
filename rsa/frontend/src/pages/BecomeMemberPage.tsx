import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { User, MapPin, FileText, Users } from 'lucide-react'; // Added Users for sex
import '../index.css';

const BecomeMemberPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    drivingLicense: '',
    sex: '', // Added sex field
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically send the data to a backend API
    console.log('Form Data Submitted:', formData);
    setIsSubmitted(true);
    // Reset form after a delay or navigate
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', location: '', drivingLicense: '', sex: '' });
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container-app py-16 sm:py-24">
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Become a Valued Member
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Join our community of drivers and start earning by sharing your rides. 
              If you have a car, you can register to make money!
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            {isSubmitted ? (
              <div className="text-center py-8">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                  <UserCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Registration Successful!</h2>
                  <p className="text-gray-600">Thank you for joining. We'll review your details and get back to you soon.</p>
                </motion.div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input pl-10"
                      placeholder="e.g., John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location (City/Area)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="form-input pl-10"
                      placeholder="e.g., New York City"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="drivingLicense" className="block text-sm font-medium text-gray-700 mb-1">
                    Driving License Number
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="drivingLicense"
                      id="drivingLicense"
                      value={formData.drivingLicense}
                      onChange={handleChange}
                      required
                      className="form-input pl-10"
                      placeholder="e.g., X123456789"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">
                    Sex
                  </label>
                  <div className="relative rounded-md shadow-sm">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="sex"
                      id="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      required
                      className="form-input pl-10 pr-10"
                    >
                      <option value="" disabled>Select your sex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-primary w-full"
                  >
                    Register as a Driver
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default BecomeMemberPage;

// Placeholder for UserCheck icon if not available in lucide-react, or use a different one
const UserCheck: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <polyline points="17 11 19 13 23 9"/>
  </svg>
);