import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import '../index.css';
import { motion } from 'framer-motion';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          message: ''
        });
      }, 3000);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen ">
  
      <main className="flex-grow py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto lg:max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 lg:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-text-base dark:text-text-inverse tracking-tight mb-4">
              Get in Touch
            </h1>
            <p className="mt-2 text-lg text-text-muted dark:text-primary-200 max-w-2xl mx-auto">
              Have questions or need assistance? Fill out the form below, and our team will get back to you shortly.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-xl overflow-hidden shadow-lg lg:grid lg:grid-cols-2"
          >
            {/* Contact Information */}
            <div className="relative p-8 lg:p-10 bg-gradient-to-br from-primary-600 to-primary-900 text-text-inverse">
              <div className="absolute inset-0 opacity-10 pattern-kente"></div>
              <div className="relative z-10">
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
                <p className="mb-8 text-primary-100">
                  Reach out directly or use the form. We're here to help with all your transportation needs!
                </p>
                <div className="space-y-6">
                <div className="flex items-center">
                    <div className="bg-primary-800 bg-opacity-30 p-3 rounded-full mr-4">
                      <Phone className="h-5 w-5 text-primary-100" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-100">Phone</p>
                      <p className="text-text-inverse">+1 (555) 123-4567</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="bg-primary-800 bg-opacity-30 p-3 rounded-full mr-4">
                      <Mail className="h-5 w-5 text-primary-100" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-100">Email</p>
                      <p className="text-text-inverse">support@GIGI move.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary-800 bg-opacity-30 p-3 rounded-full mr-4 mt-1">
                      <MapPin className="h-5 w-5 text-primary-100" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-100">Address</p>
                      <p className="text-text-inverse">123 Transport Ave, Metropolis, MP 10001</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12">
                  <h3 className="text-lg font-medium text-primary-100 mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-primary-800 bg-opacity-30 p-3 rounded-full hover:bg-primary-700 transition-colors duration-300">
                      <svg className="h-5 w-5 text-primary-100" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="#" className="bg-primary-800 bg-opacity-30 p-3 rounded-full hover:bg-primary-700 transition-colors duration-300">
                      <svg className="h-5 w-5 text-primary-100" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href="#" className="bg-primary-800 bg-opacity-30 p-3 rounded-full hover:bg-primary-700 transition-colors duration-300">
                      <svg className="h-5 w-5 text-primary-100" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-8 lg:p-10  bg-tranparent ">
              {isSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircle className="h-16 w-16 text-success mb-4 mx-auto" />
                    <h3 className="text-xl font-semibold text-text-base dark:text-text-inverse mb-2">Thank You!</h3>
                    <p className="text-text-muted dark:text-primary-200">
                      Your message has been sent successfully. We'll get back to you soon.
                    </p>
                  </motion.div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-text-base dark:text-text-inverse mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                      <label htmlFor="fullName" className="form-label">Full name</label>
                    <input
                      type="text"
                        name="fullName"
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                      autoComplete="name"
                      className="form-input" 
                        placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                      <label htmlFor="email" className="form-label">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                        value={formData.email}
                        onChange={handleChange}
                      autoComplete="email"
                      className="form-input"
                        placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                      <label htmlFor="phone" className="form-label">Phone <span className="text-text-muted dark:text-primary-200 text-xs">(Optional)</span></label>
                    <input
                        type="tel"
                      name="phone"
                      id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      autoComplete="tel"
                      className="form-input"
                        placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                      <label htmlFor="message" className="form-label">Message</label>
                    <textarea
                      id="message"
                      name="message"
                        value={formData.message}
                        onChange={handleChange}
                      rows={4}
                      className="form-input"
                        placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                        disabled={isSubmitting}
                        className="flex w-full justify-center items-center btn btn-primary"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                      Send Message
                          </>
                        )}
                    </button>
                </div>
              </form>
                </>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card mt-16  dark:bg-section-dark rounded-xl p-8 shadow-md text-center"
          >
            <h2 className="text-2xl font-semibold text-text-base dark:text-text-inverse mb-4">Visit Our Office</h2>
            <p className="text-text-muted dark:text-primary-200 mb-6">
              We're open Monday through Friday, 9:00 AM to 6:00 PM.
            </p>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <iframe 
                className="w-full h-64 rounded-lg"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1015692905854!2d-74.00714768505627!3d40.75990794258234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259ae15b2adcb%3A0x7955420634fd7eba!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1676401066718!5m2!1sen!2sus" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy"
                title="Office Location"
              ></iframe>
          </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;