import React, { useState, useEffect } from 'react';
import { Cookie, Settings, Eye, BarChart3, Shield, CheckCircle, X, Mail, Phone } from 'lucide-react';
import '../index.css';

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  essential: boolean;
  enabled: boolean;
  examples: string[];
}

const CookiesPage: React.FC = () => {
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.animate-on-scroll');
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.8) {
          section.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [cookieSettings, setCookieSettings] = useState<CookieCategory[]>([
    {
      id: 'essential',
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      essential: true,
      enabled: true,
      examples: ['Authentication', 'Security', 'Form submission', 'Load balancing']
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'These cookies enable enhanced functionality and personalization.',
      essential: false,
      enabled: true,
      examples: ['Language preferences', 'Region selection', 'User interface customization']
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      essential: false,
      enabled: true,
      examples: ['Google Analytics', 'Page views', 'User behavior tracking', 'Performance metrics']
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'These cookies are used to deliver relevant advertisements and track campaign effectiveness.',
      essential: false,
      enabled: false,
      examples: ['Ad targeting', 'Social media integration', 'Campaign tracking', 'Retargeting']
    }
  ]);

  const toggleCookie = (id: string) => {
    setCookieSettings(prev =>
      prev.map(cookie =>
        cookie.id === id && !cookie.essential
          ? { ...cookie, enabled: !cookie.enabled }
          : cookie
      )
    );
  };

  const acceptAll = () => {
    setCookieSettings(prev =>
      prev.map(cookie => ({ ...cookie, enabled: true }))
    );
  };

  const rejectOptional = () => {
    setCookieSettings(prev =>
      prev.map(cookie => ({ ...cookie, enabled: cookie.essential }))
    );
  };

  return (
    <div className="w-full">
      <div className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Cookie className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Cookie Management</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-primary dark:text-dark-primary mb-6">
              Cookies Policy
            </h1>

            <p className="text-lg text-light-secondary dark:text-dark-secondary max-w-2xl mx-auto">
              We use cookies to enhance your experience, provide personalized content,
              and analyze our website performance. Learn about our cookie usage and manage your preferences.
            </p>

            <div className="text-sm text-light-tertiary dark:text-dark-tertiary mt-4">
              Last updated: December 2024
            </div>
          </div>

          {/* What Are Cookies */}
          <section className="card mb-12 animate-on-scroll">
            <div className="flex items-center mb-6">
              <div className="icon-badge icon-badge-lg bg-primary/10 text-primary mr-4">
                <Cookie className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                What Are Cookies?
              </h2>
            </div>

            <div className="space-y-4 text-light-secondary dark:text-dark-secondary">
              <p>
                Cookies are small text files that are stored on your device when you visit our website.
                They help us provide you with a better experience by remembering your preferences,
                keeping you logged in, and helping us understand how you use our services.
              </p>

              <p>
                We use both first-party cookies (set by GIGI move) and third-party cookies
                (set by our partners and service providers) to deliver our services effectively.
              </p>
            </div>
          </section>

          {/* Cookie Categories */}
          <section className="mb-12 animate-on-scroll">
            <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-8 text-center">
              Cookie Categories & Settings
            </h2>

            <div className="space-y-6">
              {cookieSettings.map((category) => (
                <div key={category.id} className="card border border-light dark:border-dark">
                  <div className="flex items-start justify-between p-6">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mr-3">
                          {category.name}
                        </h3>
                        {category.essential && (
                          <span className="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">
                            Required
                          </span>
                        )}
                      </div>

                      <p className="text-light-secondary dark:text-dark-secondary mb-4">
                        {category.description}
                      </p>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-light-primary dark:text-dark-primary">
                          Examples:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {category.examples.map((example, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-surface-light dark:bg-surface-dark text-light-secondary dark:text-dark-secondary rounded"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex-shrink-0">
                      <button
                        onClick={() => toggleCookie(category.id)}
                        disabled={category.essential}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          category.enabled
                            ? 'bg-primary'
                            : 'bg-surface-light dark:bg-surface-dark border border-light dark:border-dark'
                        } ${category.essential ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            category.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cookie Control Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={acceptAll}
                className="btn btn-primary flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept All Cookies
              </button>

              <button
                onClick={rejectOptional}
                className="btn btn-secondary flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-2" />
                Reject Optional Cookies
              </button>
            </div>
          </section>

          {/* How We Use Cookies */}
          <section className="card mb-12 animate-on-scroll">
            <div className="flex items-center mb-6">
              <div className="icon-badge icon-badge-lg bg-secondary/10 text-secondary mr-4">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                How We Use Cookies
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                  Essential Functions
                </h3>
                <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                  <li>• Keep you logged in during your session</li>
                  <li>• Remember your booking preferences</li>
                  <li>• Ensure website security and prevent fraud</li>
                  <li>• Enable core website functionality</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                  Enhanced Experience
                </h3>
                <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                  <li>• Personalize content and recommendations</li>
                  <li>• Remember your language and location preferences</li>
                  <li>• Analyze website performance and usage</li>
                  <li>• Provide relevant advertisements</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="card mb-12 animate-on-scroll">
            <div className="flex items-center mb-6">
              <div className="icon-badge icon-badge-lg bg-purple/10 text-purple mr-4">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                Third-Party Cookies
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-light-secondary dark:text-dark-secondary">
                We work with trusted third-party services that may set their own cookies.
                These partners help us provide better services and analyze our website performance.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="icon-badge icon-badge-lg bg-primary/10 text-primary mx-auto mb-3">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Analytics</h4>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    Google Analytics helps us understand website usage and improve user experience.
                  </p>
                </div>

                <div className="text-center">
                  <div className="icon-badge icon-badge-lg bg-secondary/10 text-secondary mx-auto mb-3">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Security</h4>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    Security services help protect against fraud and ensure safe transactions.
                  </p>
                </div>

                <div className="text-center">
                  <div className="icon-badge icon-badge-lg bg-accent/10 text-accent mx-auto mb-3">
                    <Settings className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Functionality</h4>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    Maps, payment processing, and customer support tools enhance our services.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="card mb-12 animate-on-scroll">
            <div className="flex items-center mb-6">
              <div className="icon-badge icon-badge-lg bg-accent/10 text-accent mr-4">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                Managing Your Cookie Preferences
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-3">
                  Browser Settings
                </h3>
                <p className="text-light-secondary dark:text-dark-secondary mb-4">
                  You can control cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                  <li>• View and delete existing cookies</li>
                  <li>• Block cookies from specific websites</li>
                  <li>• Block third-party cookies</li>
                  <li>• Clear all cookies when you close your browser</li>
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-light-secondary dark:text-dark-secondary text-sm">
                  <strong>Note:</strong> Disabling certain cookies may affect website functionality
                  and your user experience. Essential cookies cannot be disabled as they are
                  necessary for the website to function properly.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="card bg-gradient-to-br from-primary/5 to-purple/5 animate-on-scroll">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-4">
                Questions About Cookies?
              </h2>

              <p className="text-light-secondary dark:text-dark-secondary mb-6">
                If you have any questions about our use of cookies or need help managing your preferences,
                please don't hesitate to contact us.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:privacy@rsa-travel.com"
                  className="btn btn-primary flex items-center justify-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Privacy Team
                </a>

                <a
                  href="/contact"
                  className="btn btn-secondary flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Support
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;