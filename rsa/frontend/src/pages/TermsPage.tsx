import React, { useEffect } from 'react';
import { FileText, Users, Car, Shield, CreditCard, AlertTriangle, Scale, Phone, Mail } from 'lucide-react';
import '../index.css';

const TermsPage: React.FC = () => {
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
              <FileText className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Legal Agreement</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-primary dark:text-dark-primary mb-6">
              Terms of Service
            </h1>

            <p className="text-lg text-light-secondary dark:text-dark-secondary max-w-2xl mx-auto">
              These terms govern your use of GIGI move's ride-sharing platform.
              Please read them carefully before using our services.
            </p>

            <div className="text-sm text-light-tertiary dark:text-dark-tertiary mt-4">
              Last updated: December 2024
            </div>
          </div>

          {/* Terms Content */}
          <div className="space-y-12">
            {/* Acceptance of Terms */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-primary/10 text-primary mr-4">
                  <Scale className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  Acceptance of Terms
                </h2>
              </div>

              <div className="space-y-4 text-light-secondary dark:text-dark-secondary">
                <p>
                  By accessing or using GIGI move's services, you agree to be bound by these Terms of Service
                  and all applicable laws and regulations. If you do not agree with any of these terms,
                  you are prohibited from using our services.
                </p>

                <p>
                  These terms constitute a legally binding agreement between you and GIGI move.
                  We reserve the right to update these terms at any time, and your continued use
                  of our services constitutes acceptance of any changes.
                </p>
              </div>
            </section>

            {/* Service Description */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-secondary/10 text-secondary mr-4">
                  <Car className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  Service Description
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-3">
                    Platform Services
                  </h3>
                  <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                    <li>• GIGI move provides a technology platform that connects passengers with drivers</li>
                    <li>• We facilitate ride-sharing arrangements but do not provide transportation services directly</li>
                    <li>• All rides are provided by independent drivers using their own vehicles</li>
                    <li>• We process payments and provide customer support for platform-related issues</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-3">
                    Service Availability
                  </h3>
                  <p className="text-light-secondary dark:text-dark-secondary">
                    Our services are currently available in select African cities. Service availability
                    may vary by location and time. We do not guarantee that rides will be available
                    at all times or in all locations.
                  </p>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-accent/10 text-accent mr-4">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  User Responsibilities
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    All Users Must
                  </h3>
                  <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                    <li>• Provide accurate and current information</li>
                    <li>• Maintain the security of your account</li>
                    <li>• Comply with all applicable laws</li>
                    <li>• Treat other users with respect</li>
                    <li>• Not use the service for illegal activities</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    Drivers Must Additionally
                  </h3>
                  <ul className="space-y-2 text-light-secondary dark:text-dark-secondary">
                    <li>• Hold a valid driver's license</li>
                    <li>• Maintain vehicle insurance</li>
                    <li>• Keep vehicle in safe condition</li>
                    <li>• Follow traffic laws and regulations</li>
                    <li>• Complete background verification</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Payment Terms */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-purple/10 text-purple mr-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  Payment Terms
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-light-primary dark:text-dark-primary">Passenger Payments</h4>
                    <ul className="space-y-1 text-light-secondary dark:text-dark-secondary text-sm">
                      <li>• Payments are processed securely through our platform</li>
                      <li>• Prices are calculated based on distance and time</li>
                      <li>• Additional fees may apply for cancellations</li>
                      <li>• Refunds are subject to our refund policy</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-light-primary dark:text-dark-primary">Driver Earnings</h4>
                    <ul className="space-y-1 text-light-secondary dark:text-dark-secondary text-sm">
                      <li>• Drivers receive the majority of each fare</li>
                      <li>• Platform fees are deducted from gross earnings</li>
                      <li>• Payments are processed weekly</li>
                      <li>• Tax reporting is the driver's responsibility</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-light-secondary dark:text-dark-secondary text-sm">
                    <strong>Important:</strong> All financial transactions are subject to applicable taxes
                    and fees. Users are responsible for understanding their tax obligations in their jurisdiction.
                  </p>
                </div>
              </div>
            </section>

            {/* Safety & Liability */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-accent/10 text-accent mr-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  Safety & Liability
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-3">
                    Safety Measures
                  </h3>
                  <p className="text-light-secondary dark:text-dark-secondary mb-4">
                    We implement various safety features including driver verification, trip tracking,
                    and emergency support. However, users participate in ride-sharing at their own risk.
                  </p>
                </div>

                <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-6 h-6 text-accent mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-light-primary dark:text-dark-primary mb-2">
                        Limitation of Liability
                      </h4>
                      <p className="text-light-secondary dark:text-dark-secondary text-sm">
                        GIGI move acts as an intermediary platform and is not liable for actions of drivers
                        or passengers. Users agree to hold GIGI move harmless from claims arising from
                        ride-sharing activities. Our liability is limited to the maximum extent permitted by law.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-secondary/10 text-secondary mr-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  Prohibited Activities
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-light-primary dark:text-dark-primary">Platform Misuse</h4>
                  <ul className="space-y-1 text-light-secondary dark:text-dark-secondary text-sm">
                    <li>• Creating fake accounts or profiles</li>
                    <li>• Manipulating ratings or reviews</li>
                    <li>• Interfering with platform operations</li>
                    <li>• Reverse engineering our technology</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-light-primary dark:text-dark-primary">Illegal Activities</h4>
                  <ul className="space-y-1 text-light-secondary dark:text-dark-secondary text-sm">
                    <li>• Transportation of illegal substances</li>
                    <li>• Harassment or discrimination</li>
                    <li>• Fraudulent payment activities</li>
                    <li>• Violation of local transportation laws</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section className="card animate-on-scroll">
              <div className="flex items-center mb-6">
                <div className="icon-badge icon-badge-lg bg-purple/10 text-purple mr-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  Account Termination
                </h2>
              </div>

              <div className="space-y-4 text-light-secondary dark:text-dark-secondary">
                <p>
                  Either party may terminate this agreement at any time. GIGI move reserves the right
                  to suspend or terminate accounts for violations of these terms, illegal activities,
                  or behavior that compromises platform safety.
                </p>

                <p>
                  Upon termination, your access to the platform will be revoked, but these terms
                  will continue to apply to any outstanding obligations or disputes.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="card bg-gradient-to-br from-primary/5 to-purple/5 animate-on-scroll">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-4">
                  Questions About These Terms?
                </h2>

                <p className="text-light-secondary dark:text-dark-secondary mb-6">
                  If you have any questions about these Terms of Service or need clarification
                  on any provisions, please contact our legal team.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:legal@rsa-travel.com"
                    className="btn btn-primary flex items-center justify-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Legal Team
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

export default TermsPage;