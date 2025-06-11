import React, { useState } from 'react';
import {
  ShieldCheck,
  DollarSign,
  Users,
  Leaf,
  Clock,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';

import '../index.css';

// Define benefit data
interface Benefit {
  icon: React.ElementType;
  title: string;
  description: string;
  detailedDescription: string;
  iconBgClass?: string;
  iconColorClass?: string;
}

const passengerBenefits: Benefit[] = [
  {
    icon: ShieldCheck,
    title: 'Enhanced Safety',
    description: "Travel with peace of mind knowing you're not alone. Our platform includes safety features and verified drivers.",
    detailedDescription: "Our comprehensive safety measures include real-time ride tracking, SOS buttons, and a thorough driver verification process. We prioritize your security at every step of your journey, ensuring a trustworthy community for all users.",
    iconBgClass: "bg-success bg-opacity-20",
    iconColorClass: "text-success",
  },
  {
    icon: DollarSign,
    title: 'Convenience & Affordability',
    description: 'Find rides easily along your route, often at a lower cost than traditional options. Share the ride, share the cost.',
    detailedDescription: "Our smart matching algorithm connects you with drivers heading your way, making your commute or travel plans seamless. By sharing rides, you significantly cut down on fuel and toll expenses, making travel more economical.",
    iconBgClass: "bg-primary-100 dark:bg-primary-900",
    iconColorClass: "text-primary dark:text-primary-200",
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    description: 'Reduce traffic congestion and your carbon footprint by sharing rides.',
    detailedDescription: "Fewer cars on the road mean less CO2 emissions and reduced traffic jams. By choosing GIGI move, you're actively contributing to a greener planet and more sustainable urban environments.",
    iconBgClass: "bg-accent-green bg-opacity-20",
    iconColorClass: "text-accent-green",
  },
];

const driverBenefits: Benefit[] = [
  {
    icon: DollarSign,
    title: 'Earn Extra Income',
    description: "Turn your empty seats into cash. Cover fuel costs, vehicle maintenance, or simply make extra money on routes you're already driving.",
    detailedDescription: "Maximize your car's utility by offering rides on your usual routes. Our platform provides transparent earnings, easy payout options, and helps you offset the costs of car ownership effectively.",
    iconBgClass: "bg-primary-100 dark:bg-primary-900",
    iconColorClass: "text-primary dark:text-primary-200",
  },
  {
    icon: Clock,
    title: 'Flexibility & Control',
    description: 'Drive when you want, where you want. Set your own schedule and choose the trips that work best for you.',
    detailedDescription: "As a GIGI move driver, you are your own boss. Accept ride requests that fit your schedule and preferences. Our platform empowers you with the tools to manage your availability and trips efficiently.",
    iconBgClass: "bg-accent-yellow bg-opacity-20",
    iconColorClass: "text-accent-yellow dark:text-accent-kente-gold",
  },
  {
    icon: UserCheck,
    title: 'Increased Safety',
    description: 'Share your journey with verified passengers. Having company on the road can enhance your personal safety, especially on long or late-night drives.',
    detailedDescription: "We verify passenger identities to build a trusted community. Knowing who you're sharing your ride with adds an extra layer of security, making your driving experience more comfortable and secure.",
    iconBgClass: "bg-success bg-opacity-20",
    iconColorClass: "text-success",
  },
];

// Testimonials data
interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    role: "Regular Passenger",
    text: "I've been using GIGI move for my daily commute and it's been a game-changer. Saved money and made new friends!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    name: "David K.",
    role: "Driver Partner",
    text: "Started driving to offset my car expenses and now I'm earning enough to cover my monthly car payments. Highly recommend!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
];

// Reusable Benefit Card Component
interface BenefitCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  detailedDescription: string;
  iconBgClass?: string;
  iconColorClass?: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  detailedDescription, 
  iconBgClass = 'bg-primary-100 dark:bg-primary-900', 
  iconColorClass = 'text-primary dark:text-primary-200' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      variants={fadeInUp} 
      className="card p-6 rounded-xl shadow-md border border-primary-100 dark:border-primary-800 bg-light dark:bg-section-dark hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ y: -5 }}
      layout
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 ${iconBgClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-6 w-6 ${iconColorClass}`} />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-1">{title}</h3>
          <p className="text-sm text-light-secondary dark:text-dark-secondary">{description}</p>
        </div>
        <div className="flex-shrink-0 ml-2 mt-1">
          {isExpanded ?
            <ChevronUp className="h-5 w-5 text-light-secondary dark:text-dark-secondary" /> :
            <ChevronDown className="h-5 w-5 text-light-secondary dark:text-dark-secondary" />
          }
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isExpanded ? 1 : 0, height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-primary-100 dark:border-primary-800">
            <p className="text-sm text-light-primary dark:text-dark-primary whitespace-pre-line">{detailedDescription}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Testimonial Card Component
const TestimonialCard: React.FC<Testimonial> = ({ name, role, text, rating, avatar }) => {
  return (
    <motion.div 
      variants={fadeInUp}
      className="bg-section-light dark:bg-section-dark rounded-xl shadow-md p-6 border border-primary-100 dark:border-primary-800"
    >
      <div className="flex items-center mb-4">
        <img 
          src={avatar} 
          alt={name} 
          className="w-12 h-12 rounded-full mr-4 border-2 border-primary"
        />
        <div>
          <h4 className="font-medium text-light-primary dark:text-dark-primary">{name}</h4>
          <p className="text-xs text-light-secondary dark:text-dark-secondary">{role}</p>
        </div>
      </div>
      <div className="flex mb-3">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-accent-yellow dark:text-accent-kente-gold fill-current" />
        ))}
      </div>
      <p className="text-sm text-light-primary dark:text-dark-primary italic">"{text}"</p>
    </motion.div>
  );
};

const LearnMorePage: React.FC = () => {
  return (
    <div className="w-full">
      <div className="py-12 sm:py-20">
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="container-app px-4 sm:px-6 lg:px-8"
        >
          <motion.div 
            variants={fadeInUp} 
            className="text-center mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary/20 text-primary dark:text-primary text-sm font-medium mb-4">
              The Benefits of Ride Sharing
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-primary dark:text-dark-primary tracking-tight mb-6">
              A Better Way to Travel Together
            </h1>
            <p className="mt-4 text-lg text-light-secondary dark:text-dark-secondary max-w-3xl mx-auto">
              Discover how GIGI move makes travel better for everyone involved – safer journeys for passengers 
              and great opportunities for drivers.
            </p>
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            variants={fadeInUp} 
            className="mb-20 relative"
          >
            <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-transparent opacity-50 z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1542683088-abb3da334598?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1500&q=80" 
                alt="People ridesharing" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center z-20 p-8 sm:p-16">
                <div className="max-w-md">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Join Our Community</h2>
                  <p className="text-white text-lg mb-6">Experience the future of transportation with our community-driven ride-sharing platform.</p>
                  <a href="/register" className="btn btn-primary inline-flex items-center">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main benefits sections */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Section for Passengers */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-accent-light dark:bg-accent-dark rounded-xl flex items-center justify-center text-primary dark:text-primary-200 mr-4">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-light-primary dark:text-dark-primary">For Passengers: Travel Smarter, Safer</h2>
              </div>
              <div className="space-y-6">
                {passengerBenefits.map((benefit, index) => (
                  <BenefitCard
                    key={index}
                    icon={benefit.icon}
                    title={benefit.title}
                    description={benefit.description}
                    detailedDescription={benefit.detailedDescription}
                    iconBgClass={benefit.iconBgClass}
                    iconColorClass={benefit.iconColorClass}
                  />
                ))}
              </div>
            </motion.div>

            {/* Section for Drivers */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-accent-yellow bg-opacity-20 dark:bg-accent-yellow dark:bg-opacity-20 rounded-xl flex items-center justify-center text-accent-yellow dark:text-accent-kente-gold mr-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-light-primary dark:text-dark-primary">For Drivers: Earn More, Drive Securely</h2>
              </div>
              <div className="space-y-6">
                {driverBenefits.map((benefit, index) => (
                  <BenefitCard
                    key={index}
                    icon={benefit.icon}
                    title={benefit.title}
                    description={benefit.description}
                    detailedDescription={benefit.detailedDescription}
                    iconBgClass={benefit.iconBgClass}
                    iconColorClass={benefit.iconColorClass}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Testimonials Section */}
          <motion.div variants={fadeInUp} className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-light-primary dark:text-dark-primary mb-3">
                What Our Community Says
              </h2>
              <p className="text-light-secondary dark:text-dark-secondary max-w-2xl mx-auto">
                Real experiences from passengers and drivers who are part of our growing community.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            variants={fadeInUp} 
            className="mt-24 py-12 px-8 sm:px-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-black relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 pattern-kente"></div>
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to experience the benefits?</h2>
              <p className="text-lg mb-8 text-primary-100">
                Join thousands of people who are already enjoying the convenience, savings, and community of GIGI move.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <motion.a 
                  href="/become-member"
                  className="btn btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Become a Driver
                </motion.a>
                <motion.a 
                  href="/register"
                  className="btn bg-white text-primary-900 hover:bg-gray-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up as Passenger
                </motion.a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LearnMorePage;