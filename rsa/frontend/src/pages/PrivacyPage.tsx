import React, { useEffect } from 'react';
import { Shield, Eye, Lock, Database, UserCheck, Globe, Mail, Phone } from 'lucide-react';
import '../index.css';

const PrivacyPage: React.FC = () => {
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

  return (
    <div className="w-full">
      <div className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Shield className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Your Privacy Matters</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-primary dark:text-dark-primary mb-6">
              Privacy Policy
            </h1>

            <p className="text-lg text-light-secondary dark:text-dark-secondary max-w-2xl mx-auto">
              We are committed to protecting your privacy and ensuring the security of your personal information.
              This policy explains how we collect, use, and safeguard your data.
            </p>

            <div className="text-sm text-light-tertiary dark:text-dark-tertiary mt-4">
              Last updated: December 2024
            </div>
          </div>

          {/* Privacy Content */}
          <div className="space-y-12">
            {/* Information We Collect */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-primary/10 text-primary mr-4">
                  <Database className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  Information We Collect
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-3">
                    Personal Information
                  </h3>
                  <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                    <li>• Full name and contact information (email, phone number)</li>
                    <li>• Profile information and preferences</li>
                    <li>• Payment information (processed securely through third-party providers)</li>
                    <li>• Government-issued ID for driver verification</li>
                    <li>• Vehicle information for drivers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-3">
                    Usage Information
                  </h3>
                  <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                    <li>• Trip history and booking details</li>
                    <li>• Location data during active trips</li>
                    <li>• Device information and app usage patterns</li>
                    <li>• Communication records for customer support</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-secondary/10 text-secondary mr-4">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  How We Use Your Information
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    Service Provision
                  </h3>
                  <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                    <li>• Facilitate ride bookings and connections</li>
                    <li>• Process payments and transactions</li>
                    <li>• Provide customer support</li>
                    <li>• Ensure safety and security</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    Improvement & Communication
                  </h3>
                  <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                    <li>• Improve our services and user experience</li>
                    <li>• Send important updates and notifications</li>
                    <li>• Conduct research and analytics</li>
                    <li>• Comply with legal requirements</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-accent/10 text-accent mr-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  Data Protection & Security
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-light-secondary dark:text-dark-secondary">
                  We implement industry-standard security measures to protect your personal information:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-light-primary dark:text-dark-primary">Technical Safeguards</h4>
                    <ul className="space-y-1 text-light-secondary dark:text-dark-secondary text-sm">
                      <li>• End-to-end encryption for sensitive data</li>
                      <li>• Secure data transmission (SSL/TLS)</li>
                      <li>• Regular security audits and updates</li>
                      <li>• Access controls and authentication</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-light-primary dark:text-dark-primary">Operational Safeguards</h4>
                    <ul className="space-y-1 text-light-secondary dark:text-dark-secondary text-sm">
                      <li>• Limited access to personal data</li>
                      <li>• Employee training on data protection</li>
                      <li>• Incident response procedures</li>
                      <li>• Regular backup and recovery testing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-purple/10 text-purple mr-4">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  Your Privacy Rights
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    Access & Control
                  </h3>
                  <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                    <li>• Access your personal information</li>
                    <li>• Update or correct your data</li>
                    <li>• Delete your account and data</li>
                    <li>• Export your data</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    Communication Preferences
                  </h3>
                  <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                    <li>• Opt-out of marketing communications</li>
                    <li>• Control notification settings</li>
                    <li>• Manage cookie preferences</li>
                    <li>• Request data processing restrictions</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-secondary/10 text-secondary mr-4">
                  <Globe className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  Data Sharing & Third Parties
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-light-secondary dark:text-dark-secondary">
                  We only share your information in the following circumstances:
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Service Providers</h4>
                    <p className="text-light-secondary dark:text-dark-secondary text-sm">
                      We work with trusted third-party service providers for payment processing,
                      mapping services, and customer support. These partners are bound by strict
                      confidentiality agreements.
                    </p>
                  </div>

                  <div className="border-l-4 border-secondary pl-4">
                    <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Legal Requirements</h4>
                    <p className="text-light-secondary dark:text-dark-secondary text-sm">
                      We may disclose information when required by law, court order, or to protect
                      the safety and security of our users and the public.
                    </p>
                  </div>

                  <div className="border-l-4 border-accent pl-4">
                    <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Business Transfers</h4>
                    <p className="text-light-secondary dark:text-dark-secondary text-sm">
                      In the event of a merger, acquisition, or sale of assets, user information
                      may be transferred as part of the business transaction.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="card bg-gradient-to-br from-primary/5 to-purple/5 animate-on-scroll">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-4">
                  Questions About Your Privacy?
                </h2>

                <p className="text-light-secondary dark:text-dark-secondary mb-6">
                  If you have any questions about this Privacy Policy or how we handle your data,
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
    </div>
  );
};

export default PrivacyPage;