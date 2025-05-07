import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import '../index.css';
import Navbar from '../components/common/Navbar'; // Assuming Navbar is updated
import Footer from '../components/common/Footer'; // Assuming Footer is updated

const ContactPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      {/* Updated: Page padding and max-width */}
      <main className="flex-grow py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto lg:max-w-5xl">
          {/* Updated: Heading and description styling */}
          <div className="text-center mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Get in Touch</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions or need assistance? Fill out the form below, and our team will get back to you shortly.
            </p>
          </div>

          {/* Updated: Card styling, grid layout, rounded-xl */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:grid lg:grid-cols-2 lg:gap-px"> {/* Added rounded-xl */}
            {/* Contact Information - Refined Styling */}
            <div className="relative p-8 lg:p-10 bg-gradient-to-br from-indigo-600 to-purple-600 text-white"> {/* Pocket-like gradient */}
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              <p className="mb-6 text-indigo-100">Reach out directly or use the form. We're here to help!</p> {/* Adjusted text color */}
              <div className="space-y-5">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-indigo-200 flex-shrink-0" /> {/* Adjusted icon color */}
                  <span className="text-indigo-50">+1 (555) 123-4567</span> {/* Adjusted text color */}
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-indigo-200 flex-shrink-0" /> {/* Adjusted icon color */}
                  <span className="text-indigo-50">support@ridebooker.com</span> {/* Adjusted text color */}
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-indigo-200 mt-1 flex-shrink-0" /> {/* Adjusted icon color */}
                  <span className="text-indigo-50">123 Transport Ave, Metropolis, MP 10001</span> {/* Adjusted text color */}
                </div>
              </div>
            </div>

            {/* Contact Form - Refined Styling */}
            <div className="p-8 lg:p-10 bg-white">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
              <form action="#" method="POST">
                <div className="grid grid-cols-1 gap-y-6">
                  <div>
                    <label htmlFor="full-name" className="sr-only">Full name</label>
                    <input
                      type="text"
                      name="full-name"
                      id="full-name"
                      autoComplete="name"
                      className="form-input" 
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="form-input"
                      placeholder="Email address"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="sr-only">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      autoComplete="tel"
                      className="form-input"
                      placeholder="Phone number (Optional)"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="sr-only">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="form-input"
                      placeholder="Your message"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;