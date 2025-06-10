import '../../index.css';
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Bus, ArrowRight, ChevronRight, Heart, Send, Star, Award, Shield, Clock } from 'lucide-react';
import Logo from './Logo';
import { TransitionContext } from '../../App';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { startPageTransition, isPending } = useContext(TransitionContext);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Custom navigation handler that uses startTransition
  const handleNavigation = (path: string) => {
    startPageTransition(() => {
      navigate(path);
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-light via-primary/5 to-light dark:from-dark dark:via-primary/10 dark:to-dark border-t border-secondary/20 dark:border-secondary/40 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Newsletter Section */}
      <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 dark:from-primary/80 dark:via-primary/70 dark:to-primary/60">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="lg:max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white">
                  Stay in the Loop
                </h3>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                Get exclusive updates on new routes, special promotions, and travel insights delivered straight to your inbox.
              </p>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-white/80">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm">10k+ subscribers</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">No spam, ever</span>
                </div>
              </div>
            </div>
            <div className="lg:max-w-md w-full">
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-lg"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
                </div>
                <button
                  type="submit"
                  disabled={isSubscribed}
                  className="w-full px-6 py-4 bg-primary hover:bg-primary/90 text-black font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isSubscribed ? (
                    <>
                      <Award className="h-5 w-5" />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      Subscribe Now
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Logo and About */}
          <div className="lg:col-span-2 space-y-6">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/');
              }}
              className="inline-flex items-center gap-3 group"
            >
              <div className="relative">
                <Logo
                  variant="primary"
                  size="lg"
                  showText={false}
                  className="h-10 w-10"
                />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:bg-primary/30 transition-all duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                GIGI move
              </span>
            </a>

            <p className="text-dark dark:text-light text-lg leading-relaxed max-w-md">
              Revolutionizing transportation across Africa with safe, convenient, and affordable rides. Connecting communities, one journey at a time.
            </p>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="flex items-center gap-2 p-3 bg-primary-light dark:bg-primary/20 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-semibold text-primary-dark dark:text-primary-light">Safe</div>
                  <div className="text-xs text-primary dark:text-primary-medium">Verified drivers</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-primary-light dark:bg-primary/20 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-semibold text-primary-dark dark:text-primary-light">24/7</div>
                  <div className="text-xs text-primary dark:text-primary-medium">Available</div>
                </div>
              </div>
            </div>

            {/* Enhanced Social Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-light-primary dark:text-dark-primary uppercase tracking-wider">
                Follow Us
              </h4>
              <div className="flex space-x-3">
                {[
                  { icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-500' },
                  { icon: Twitter, label: 'Twitter', color: 'hover:bg-sky-500' },
                  { icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-500' }
                ].map(({ icon: Icon, label, color }) => (
                  <a
                    key={label}
                    href="#"
                    className={`group relative w-12 h-12 rounded-xl flex items-center justify-center bg-surface-light dark:bg-surface-dark border border-light dark:border-dark hover:border-transparent transition-all duration-300 ${color} hover:text-white hover:scale-110 hover:shadow-lg`}
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5 text-light-secondary dark:text-dark-secondary group-hover:text-white transition-colors" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-light-primary dark:text-dark-primary uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { path: '/about', label: 'About Us', icon: '🏢' },
                { path: '/become-member', label: 'Become a Driver', icon: '🚗' },
                { path: '/learn-more', label: 'Learn More', icon: '📚' },
                { path: '/booking', label: 'Book a Ride', icon: '🎫' }
              ].map((link) => (
                <li key={link.path}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(link.path);
                    }}
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-primary-light dark:hover:bg-primary/20 transition-all duration-300"
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span className="text-light-secondary dark:text-dark-secondary group-hover:text-primary dark:group-hover:text-primary-medium transition-colors">
                      {link.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-primary-medium dark:text-primary group-hover:translate-x-1 transition-transform ml-auto" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-light-primary dark:text-dark-primary uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              Information
            </h3>
            <ul className="space-y-4">
              {[
                { path: '/terms', label: 'Terms of Service', icon: '📋' },
                { path: '/privacy', label: 'Privacy Policy', icon: '🔒' },
                { path: '/faq', label: 'FAQ', icon: '❓' },
                { path: '/contact', label: 'Contact Us', icon: '📞' }
              ].map((link) => (
                <li key={link.path}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(link.path);
                    }}
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-primary-light dark:hover:bg-primary/20 transition-all duration-300"
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span className="text-light-secondary dark:text-dark-secondary group-hover:text-primary dark:group-hover:text-primary-medium transition-colors">
                      {link.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-primary-medium dark:text-primary group-hover:translate-x-1 transition-transform ml-auto" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-light-primary dark:text-dark-primary uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              Contact
            </h3>
            <div className="space-y-6">
              <div className="group p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-light dark:border-dark hover:border-primary-medium dark:hover:border-primary transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-light dark:bg-primary/30 rounded-lg group-hover:bg-primary-medium dark:group-hover:bg-primary/50 transition-colors">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-1">
                      Head Office
                    </h4>
                    <p className="text-light-secondary dark:text-dark-secondary text-sm leading-relaxed">
                      123 Transport Avenue<br />
                      Johannesburg, South Africa
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-light dark:border-dark hover:border-primary-medium dark:hover:border-primary transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-light dark:bg-primary/30 rounded-lg group-hover:bg-primary-medium dark:group-hover:bg-primary/50 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-1">
                      Call Us
                    </h4>
                    <a
                      href="tel:+27101234567"
                      className="text-light-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-primary-medium transition-colors text-sm"
                    >
                      +27 (10) 123-4567
                    </a>
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-light dark:border-dark hover:border-primary-medium dark:hover:border-primary transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-light dark:bg-primary/30 rounded-lg group-hover:bg-primary-medium dark:group-hover:bg-primary/50 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-1">
                      Email Us
                    </h4>
                    <a
                      href="mailto:info@gigimove.com"
                      className="text-light-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-primary-medium transition-colors text-sm"
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
      <div className="relative border-t border-primary-200/50 dark:border-primary-800/50 bg-gradient-to-r from-surface-light via-primary-50/30 to-surface-light dark:from-surface-dark dark:via-primary-900/20 dark:to-surface-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm text-light-secondary dark:text-dark-secondary">
                  &copy; {currentYear} GIGI move. All rights reserved.
                </p>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-light-tertiary dark:bg-dark-tertiary rounded-full"></div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-light-secondary dark:text-dark-secondary flex items-center gap-1">
                  Made with <Heart className="h-3 w-3 text-accent animate-pulse" /> in Africa
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
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
                    className="text-sm text-light-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-primary-medium transition-colors font-medium"
                  >
                    {link.label}
                  </a>
                  {index < 2 && (
                    <div className="w-1 h-1 bg-light-tertiary dark:bg-dark-tertiary rounded-full"></div>
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