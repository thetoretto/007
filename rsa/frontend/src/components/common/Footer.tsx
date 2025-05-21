import '../../index.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="card border-t border-primary-100 dark:border-primary-800">
      <div className="container-app py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 xl:col-span-2">
          <div className="col-span-2 md:col-span-1 mb-8 md:mb-0">
            <h2 className="text-lg font-semibold text-text-base dark:text-text-inverse mb-3">RideBooker</h2>
            <p className="text-text-muted dark:text-primary-200 text-sm leading-relaxed">
              Providing safe, convenient, and affordable transportation services across Africa.
            </p>
            <div className="flex space-x-5 mt-6">
              <a href="#" className="text-text-muted hover:text-primary dark:text-primary-200 dark:hover:text-primary-100 transition-colors"> 
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-muted hover:text-primary dark:text-primary-200 dark:hover:text-primary-100 transition-colors"> 
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-muted hover:text-primary dark:text-primary-200 dark:hover:text-primary-100 transition-colors"> 
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-text-muted dark:text-primary-100 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/become-member" className="text-sm text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 transition-colors">
                  Become a Driver
                </Link>
              </li>
              <li>
                <Link to="/learn-more" className="text-sm text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 transition-colors">
                  Learn More
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-sm text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 transition-colors">
                  Book a Ride
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-text-muted dark:text-primary-100 uppercase tracking-wider mb-4">
              Information
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-sm text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-text-muted dark:text-primary-100 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary dark:text-primary-200 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-base dark:text-text-inverse">
                  123 Transport Ave, Johannesburg, South Africa
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary dark:text-primary-200 mr-2 flex-shrink-0" />
                <span className="text-sm text-text-base dark:text-text-inverse">+27 (10) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary dark:text-primary-200 mr-2 flex-shrink-0" />
                <Link to="/contact" className="text-sm text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 transition-colors">
                  info@ridebooker.com
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-primary-100 dark:border-primary-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-text-muted dark:text-primary-200 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} RideBooker. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-xs text-text-muted hover:text-primary dark:text-primary-300 dark:hover:text-primary-200 transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="text-xs text-text-muted hover:text-primary dark:text-primary-300 dark:hover:text-primary-200 transition-colors">
                Privacy
              </Link>
              <Link to="/cookies" className="text-xs text-text-muted hover:text-primary dark:text-primary-300 dark:hover:text-primary-200 transition-colors">
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