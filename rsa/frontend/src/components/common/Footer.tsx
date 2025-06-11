import '../../index.css';
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart, ExternalLink } from 'lucide-react';
import Logo from './Logo';
import { TransitionContext } from '../../context/TransitionContext';

interface FooterProps {
  variant?: 'public' | 'dashboard';
}

const Footer: React.FC<FooterProps> = ({ variant = 'public' }) => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();
  const { startPageTransition } = useContext(TransitionContext);

  // Custom navigation handler that uses startTransition
  const handleNavigation = (path: string) => {
    startPageTransition(() => {
      navigate(path);
    });
  };

  // Determine if we're on a dashboard page
  const isDashboard = location.pathname.includes('/admin') ||
                     location.pathname.includes('/driver') ||
                     location.pathname.includes('/passenger');

  // If it's a dashboard page or variant is dashboard, show minimal footer
  if (variant === 'dashboard' || isDashboard) {
    return (
      <footer className="bg-surface-light dark:bg-surface-dark border-t border-light dark:border-dark shadow-md transition-all duration-300">
        <div className="container-app py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 group">
                <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-all duration-300">
                  <Logo variant="primary" size="sm" showText={false} className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary transition-colors duration-300">
                  GIGI move
                </span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-secondary/40 dark:bg-secondary/60 rounded-full"></div>
              <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-300">
                &copy; {currentYear} All rights reserved
              </p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { path: '/privacy', label: 'Privacy' },
                { path: '/terms', label: 'Terms' },
                { path: '/contact', label: 'Support' }
              ].map((link, index) => (
                <React.Fragment key={link.path}>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleNavigation(link.path); }}
                    className="text-xs text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-primary-light transition-all duration-300 px-2 py-1 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20"
                  >
                    {link.label}
                  </a>
                  {index < 2 && (
                    <div className="w-1 h-1 bg-secondary/40 dark:bg-secondary/60 rounded-full"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Public footer - clean and modern design
  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-light dark:border-dark shadow-lg transition-all duration-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-xl group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-all duration-300 shadow-sm">
                <Logo variant="primary" size="md" showText={false} className="h-7 w-7" />
              </div>
              <span className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary transition-colors duration-300">
                GIGI move
              </span>
            </div>
            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary leading-relaxed transition-colors duration-300">
              Safe, reliable, and affordable transportation across Africa. Connecting communities, one journey at a time.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: Facebook, label: 'Facebook', href: '#', color: 'hover:bg-blue-500 hover:shadow-lg' },
                { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:bg-sky-500 hover:shadow-lg' },
                { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:bg-pink-500 hover:shadow-lg' }
              ].map(({ icon: Icon, label, href, color }) => (
                <a
                  key={label}
                  href={href}
                  className={`p-2.5 rounded-xl bg-surface-light-alt dark:bg-surface-dark-alt text-text-light-secondary dark:text-text-dark-secondary border border-light dark:border-dark hover:text-white hover:border-transparent transition-all duration-300 shadow-sm hover:scale-110 ${color}`}
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary uppercase tracking-wider transition-colors duration-300 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { path: '/about', label: 'About Us' },
                { path: '/become-member', label: 'Become a Driver' },
                { path: '/booking', label: 'Book a Ride' },
                { path: '/learn-more', label: 'Learn More' }
              ].map((link) => (
                <li key={link.path}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(link.path);
                    }}
                    className="text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-primary-light transition-all duration-300 flex items-center gap-2 group p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary uppercase tracking-wider transition-colors duration-300 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-secondary to-primary rounded-full"></div>
              Support
            </h3>
            <ul className="space-y-3">
              {[
                { path: '/contact', label: 'Contact Us' },
                { path: '/faq', label: 'FAQ' },
                { path: '/terms', label: 'Terms of Service' },
                { path: '/privacy', label: 'Privacy Policy' }
              ].map((link) => (
                <li key={link.path}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(link.path);
                    }}
                    className="text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-primary-light transition-all duration-300 flex items-center gap-2 group p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary uppercase tracking-wider transition-colors duration-300 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-accent to-secondary rounded-full"></div>
              Contact
            </h3>
            <div className="space-y-4">
              <div className="group p-3 bg-surface-light-alt dark:bg-surface-dark-alt rounded-xl border border-light dark:border-dark hover:border-primary dark:hover:border-primary-light transition-all duration-300 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-all duration-300">
                    <MapPin className="h-4 w-4 text-primary dark:text-primary-light" />
                  </div>
                  <div className="text-sm text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-300">
                    <p className="font-medium text-text-light-primary dark:text-text-dark-primary">Head Office</p>
                    <p className="mt-1">123 Transport Avenue</p>
                    <p>Johannesburg, South Africa</p>
                  </div>
                </div>
              </div>

              <div className="group p-3 bg-surface-light-alt dark:bg-surface-dark-alt rounded-xl border border-light dark:border-dark hover:border-primary dark:hover:border-primary-light transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-all duration-300">
                    <Phone className="h-4 w-4 text-primary dark:text-primary-light" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary">Call Us</p>
                    <a
                      href="tel:+27101234567"
                      className="text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-primary-light transition-colors duration-300"
                    >
                      +27 (10) 123-4567
                    </a>
                  </div>
                </div>
              </div>

              <div className="group p-3 bg-surface-light-alt dark:bg-surface-dark-alt rounded-xl border border-light dark:border-dark hover:border-primary dark:hover:border-primary-light transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-all duration-300">
                    <Mail className="h-4 w-4 text-primary dark:text-primary-light" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary">Email Us</p>
                    <a
                      href="mailto:info@gigimove.com"
                      className="text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-primary-light transition-colors duration-300"
                    >
                      info@gigimove.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Bottom Bar */}
      <div className="border-t border-light dark:border-dark bg-surface-light-alt dark:bg-surface-dark-alt transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-300">
                &copy; {currentYear} GIGI move. All rights reserved.
              </p>
              <div className="hidden sm:block w-1 h-1 bg-secondary/40 dark:bg-secondary/60 rounded-full"></div>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary flex items-center gap-1 transition-colors duration-300">
                Made with <Heart className="h-3 w-3 text-accent animate-pulse" /> in Africa
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[
                { path: '/terms', label: 'Terms' },
                { path: '/privacy', label: 'Privacy' },
                { path: '/cookies', label: 'Cookies' }
              ].map((link, index) => (
                <React.Fragment key={link.path}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(link.path);
                    }}
                    className="text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-primary-light transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20"
                  >
                    {link.label}
                  </a>
                  {index < 2 && (
                    <div className="w-1 h-1 bg-secondary/40 dark:bg-secondary/60 rounded-full"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;