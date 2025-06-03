import '../../index.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Bus, ArrowRight, ChevronRight, Heart } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      {/* Newsletter Section */}
      <div className="bg-primary-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h3 className="text-xl font-bold text-primary-800 dark:text-primary-200 mb-2">
                Stay Updated
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md">
                Subscribe to our newsletter for the latest updates on routes, promotions, and travel tips.
              </p>
            </div>
            <div className="flex-1 max-w-md">
              <form className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 btn btn-accent hover:bg-accent-kente-gold/90 text-black font-medium rounded-lg transition-all flex items-center justify-center shadow-sm hover:shadow"
                >
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and About */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Logo 
                variant="primary"
                size="lg"
                showText={true}
                className=""
              />
            </Link>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              Providing safe, convenient, and affordable transportation services across Africa. Connecting cities and people with reliable rides.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-100 dark:bg-gray-800 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Facebook"
              > 
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-100 dark:bg-gray-800 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Twitter"
              > 
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-100 dark:bg-gray-800 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Instagram"
              > 
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { path: '/about', label: 'About Us' },
                { path: '/become-member', label: 'Become a Driver' },
                { path: '/learn-more', label: 'Learn More' },
                { path: '/booking', label: 'Book a Ride' }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="footer-link group"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-primary-400 dark:text-primary-500 group-hover:translate-x-0.5 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Information
            </h3>
            <ul className="space-y-3">
              {[
                { path: '/terms', label: 'Terms of Service' },
                { path: '/privacy', label: 'Privacy Policy' },
                { path: '/faq', label: 'FAQ' },
                { path: '/contact', label: 'Contact Us' }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="footer-link group"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-primary-400 dark:text-primary-500 group-hover:translate-x-0.5 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-800 dark:text-primary-200 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  123 Transport Ave, Johannesburg, South Africa
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary-800 dark:text-primary-200 mr-2 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">+27 (10) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary-800 dark:text-primary-200 mr-2 flex-shrink-0" />
                <a 
                  href="mailto:info@GIGI move.com" 
                  className="text-gray-600 hover:text-primary-800 dark:text-gray-300 dark:hover:text-primary-200 transition-colors"
                >
                  info@GIGI move.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; {currentYear} GIGI move. All rights reserved.
              </p>
              <span className="mx-2 text-gray-400 dark:text-gray-600">•</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                Made with <Heart className="h-3 w-3 mx-1 text-accent-red" /> in Africa
              </p>
            </div>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-sm text-gray-600 hover:text-primary-800 dark:text-gray-400 dark:hover:text-primary-200 transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-800 dark:text-gray-400 dark:hover:text-primary-200 transition-colors">
                Privacy
              </Link>
              <Link to="/cookies" className="text-sm text-gray-600 hover:text-primary-800 dark:text-gray-400 dark:hover:text-primary-200 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;