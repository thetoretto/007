import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Phone, Mail } from 'lucide-react';
import '../index.css';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: 1,
    category: 'Getting Started',
    question: 'How do I sign up for GIGI move?',
    answer: 'You can sign up by downloading our app or visiting our website. Simply provide your basic information, verify your phone number, and you\'re ready to start booking rides or offering them as a driver.'
  },
  {
    id: 2,
    category: 'Getting Started',
    question: 'Is GIGI move available in my city?',
    answer: 'GIGI move is currently available in 25+ major African cities. Check our website or app to see if we operate in your area. We\'re constantly expanding to new locations.'
  },
  {
    id: 3,
    category: 'Getting Started',
    question: 'Do I need to download an app?',
    answer: 'While we recommend using our mobile app for the best experience, you can also book rides through our website. The app provides additional features like real-time tracking and push notifications.'
  },

  // Booking Rides
  {
    id: 4,
    category: 'Booking Rides',
    question: 'How do I book a ride?',
    answer: 'Simply enter your pickup and destination locations, select your preferred departure time, and browse available rides. You can book instantly or send a request to the driver.'
  },
  {
    id: 5,
    category: 'Booking Rides',
    question: 'Can I book a ride in advance?',
    answer: 'Yes! You can book rides up to 7 days in advance. This is especially useful for airport trips, important appointments, or regular commutes.'
  },
  {
    id: 6,
    category: 'Booking Rides',
    question: 'What if I need to cancel my booking?',
    answer: 'You can cancel your booking through the app or website. Cancellation fees may apply depending on how close to the departure time you cancel. Check our cancellation policy for details.'
  },
  {
    id: 7,
    category: 'Booking Rides',
    question: 'Can I bring luggage?',
    answer: 'Most drivers can accommodate small to medium luggage. When booking, specify if you have luggage so drivers can confirm they have space. Large items should be discussed with the driver beforehand.'
  },

  // Payments
  {
    id: 8,
    category: 'Payments',
    question: 'How do I pay for rides?',
    answer: 'We accept various payment methods including credit/debit cards, mobile money, and digital wallets. Payment is processed securely through our platform after the ride is completed.'
  },
  {
    id: 9,
    category: 'Payments',
    question: 'When am I charged for a ride?',
    answer: 'You\'re charged after the ride is completed. For advance bookings, we may place a temporary hold on your payment method, but the actual charge occurs after the trip.'
  },
  {
    id: 10,
    category: 'Payments',
    question: 'Can I get a refund?',
    answer: 'Refunds are available in certain circumstances such as driver cancellations or service issues. Contact our support team with your booking details, and we\'ll review your case.'
  },

  // For Drivers
  {
    id: 11,
    category: 'For Drivers',
    question: 'How do I become a driver?',
    answer: 'To become a driver, you need a valid driver\'s license, vehicle insurance, and a vehicle in good condition. Complete our online application, pass a background check, and you can start earning.'
  },
  {
    id: 12,
    category: 'For Drivers',
    question: 'How much can I earn as a driver?',
    answer: 'Earnings vary based on factors like location, time of day, and frequency of trips. Our top drivers earn $1,200+ per month. You keep the majority of each fare, with a small platform fee deducted.'
  },
  {
    id: 13,
    category: 'For Drivers',
    question: 'When do I get paid?',
    answer: 'Driver payments are processed weekly and transferred to your registered bank account or mobile money wallet. You can track your earnings in real-time through the driver app.'
  },
  {
    id: 14,
    category: 'For Drivers',
    question: 'Can I choose which rides to accept?',
    answer: 'Yes, you have full control over which ride requests to accept. You can see passenger ratings, trip details, and estimated earnings before deciding.'
  },

  // Safety
  {
    id: 15,
    category: 'Safety',
    question: 'How do you ensure rider safety?',
    answer: 'We verify all drivers through background checks, provide real-time trip tracking, offer in-app emergency features, and maintain a 24/7 support team. Both drivers and passengers are rated to maintain community standards.'
  },
  {
    id: 16,
    category: 'Safety',
    question: 'What should I do in case of an emergency?',
    answer: 'Use the emergency button in the app to contact local authorities and our support team immediately. We also provide real-time trip sharing with trusted contacts for added security.'
  },
  {
    id: 17,
    category: 'Safety',
    question: 'Are drivers background checked?',
    answer: 'Yes, all drivers undergo comprehensive background checks including criminal history, driving record verification, and identity confirmation before being approved to drive.'
  },

  // Technical Support
  {
    id: 18,
    category: 'Technical Support',
    question: 'The app isn\'t working properly. What should I do?',
    answer: 'Try restarting the app or updating to the latest version. If problems persist, contact our technical support team with details about your device and the issue you\'re experiencing.'
  },
  {
    id: 19,
    category: 'Technical Support',
    question: 'How do I update my profile information?',
    answer: 'Go to your profile section in the app or website, select "Edit Profile," and update your information. Some changes may require verification for security purposes.'
  },
  {
    id: 20,
    category: 'Technical Support',
    question: 'I forgot my password. How do I reset it?',
    answer: 'Click "Forgot Password" on the login screen, enter your email address, and follow the instructions in the reset email. If you don\'t receive the email, check your spam folder or contact support.'
  }
];

const categories = ['All', 'Getting Started', 'Booking Rides', 'Payments', 'For Drivers', 'Safety', 'Technical Support'];

const FAQPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

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

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="w-full">
      <div className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <HelpCircle className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Help Center</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-primary dark:text-dark-primary mb-6">
              Frequently Asked Questions
            </h1>

            <p className="text-lg text-light-secondary dark:text-dark-secondary max-w-2xl mx-auto mb-8">
              Find answers to common questions about using GIGI move.
              Can't find what you're looking for? Contact our support team.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-light-tertiary dark:text-dark-tertiary" />
              </div>
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 w-full"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-12 animate-on-scroll">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === category
                      ? 'bg-primary text-dark shadow-primary'
                      : 'bg-surface-light dark:bg-surface-dark text-light-secondary dark:text-dark-secondary hover:bg-primary/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4 animate-on-scroll">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-light-tertiary dark:text-dark-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                  No FAQs found
                </h3>
                <p className="text-light-secondary dark:text-dark-secondary">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="card border border-light dark:border-dark hover:shadow-lg transition-all duration-200"
                >
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full text-left flex items-center justify-between p-6 focus:outline-none"
                  >
                    <div className="flex-1">
                      <div className="text-xs font-medium text-primary mb-1">
                        {faq.category}
                      </div>
                      <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {expandedItems.includes(faq.id) ? (
                        <ChevronUp className="w-5 h-5 text-light-tertiary dark:text-dark-tertiary" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-light-tertiary dark:text-dark-tertiary" />
                      )}
                    </div>
                  </button>

                  {expandedItems.includes(faq.id) && (
                    <div className="px-6 pb-6 border-t border-light dark:border-dark">
                      <div className="pt-4">
                        <p className="text-light-secondary dark:text-dark-secondary leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Contact Support Section */}
          <section className="card bg-gradient-to-br from-primary/5 to-purple/5 mt-16 animate-on-scroll">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-4">
                Still Need Help?
              </h2>

              <p className="text-light-secondary dark:text-dark-secondary mb-6">
                Can't find the answer you're looking for? Our support team is here to help 24/7.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@rsa-travel.com"
                  className="btn btn-primary flex items-center justify-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </a>

                <a
                  href="tel:+250788123456"
                  className="btn btn-secondary flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;