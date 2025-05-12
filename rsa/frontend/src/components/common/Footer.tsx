import '../../index.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    // Updated: Changed background, text color, padding
    <footer className="card border-t border-gray-200">
      {/* Updated: Increased max-width, adjusted padding */}
      <div className="container-app py-12 lg:py-16">
        {/* Updated: Adjusted grid layout and gap */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 xl:col-span-2">
          {/* Updated: Column span for logo/description, text styling */}
          <div className="col-span-2 md:col-span-1 mb-8 md:mb-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">RideBooker</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Providing safe, convenient, and affordable transportation services.
            </p>
            {/* Updated: Icon colors and hover states */}
            <div className="flex space-x-5 mt-6">
              <a href="#" className="text-gray-400 hover:text-primary-600"> 
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600"> 
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600"> 
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Updated: Heading and link styling */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-sm">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Updated: Heading and link styling */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Information
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-sm">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Updated: Heading and contact item styling */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  123 Transport Ave, Metropolis, MP 10001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">info@ridebooker.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Updated: Copyright text styling and spacing */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} RideBooker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;