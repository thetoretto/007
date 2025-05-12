import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ShieldCheck, DollarSign, Users, Leaf, Clock, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import '../index.css';

// Define benefit data
interface Benefit {
  icon: React.ElementType;
  title: string;
  description: string;
  detailedDescription: string; // Added for more details
}

const passengerBenefits: Benefit[] = [
  {
    icon: ShieldCheck,
    title: 'Enhanced Safety',
    description: "Travel with peace of mind knowing you're not alone. Our platform includes safety features and verified drivers.",
    detailedDescription: "Our comprehensive safety measures include real-time ride tracking, SOS buttons, and a thorough driver verification process. We prioritize your security at every step of your journey, ensuring a trustworthy community for all users.",
  },
  {
    icon: DollarSign,
    title: 'Convenience & Affordability',
    description: 'Find rides easily along your route, often at a lower cost than traditional options. Share the ride, share the cost.',
    detailedDescription: "Our smart matching algorithm connects you with drivers heading your way, making your commute or travel plans seamless. By sharing rides, you significantly cut down on fuel and toll expenses, making travel more economical.",
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    description: 'Reduce traffic congestion and your carbon footprint by sharing rides.',
    detailedDescription: "Fewer cars on the road mean less CO2 emissions and reduced traffic jams. By choosing RideBooker, you're actively contributing to a greener planet and more sustainable urban environments.",
  },
];

const driverBenefits: Benefit[] = [
  {
    icon: DollarSign,
    title: 'Earn Extra Income',
    description: "Turn your empty seats into cash. Cover fuel costs, vehicle maintenance, or simply make extra money on routes you're already driving.",
    detailedDescription: "Maximize your car's utility by offering rides on your usual routes. Our platform provides transparent earnings, easy payout options, and helps you offset the costs of car ownership effectively.",
  },
  {
    icon: Clock,
    title: 'Flexibility & Control',
    description: 'Drive when you want, where you want. Set your own schedule and choose the trips that work best for you.',
    detailedDescription: "As a RideBooker driver, you are your own boss. Accept ride requests that fit your schedule and preferences. Our platform empowers you with the tools to manage your availability and trips efficiently.",
  },
  {
    icon: UserCheck,
    title: 'Increased Safety',
    description: 'Share your journey with verified passengers. Having company on the road can enhance your personal safety, especially on long or late-night drives.',
    detailedDescription: "We verify passenger identities to build a trusted community. Knowing who you're sharing your ride with adds an extra layer of security, making your driving experience more comfortable and secure.",
  },
];

// Reusable Benefit Card Component (defined inline for simplicity)
interface BenefitCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  detailedDescription: string; // Added for more details
  iconBgColor?: string;
  iconTextColor?: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon: Icon, title, description, detailedDescription, iconBgColor = 'bg-green-100', iconTextColor = 'text-green-600' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
  <motion.div 
    variants={fadeInUp} 
    className="card p-6 rounded-lg shadow-md border border-gray-200 cursor-pointer transition-all duration-300 ease-in-out"
    onClick={() => setIsExpanded(!isExpanded)}
    layout // Enable layout animation for smooth expansion
  >
    <div className="flex items-start space-x-4">
      <div className={`w-10 h-10 ${iconBgColor} rounded-md flex items-center justify-center ${iconTextColor} flex-shrink-0 mt-1`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="flex-shrink-0 ml-2 mt-1">
        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
      </div>
    </div>
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: isExpanded ? 1 : 0, height: isExpanded ? 'auto' : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 whitespace-pre-line">{detailedDescription}</p>
        </div>
      )}
    </motion.div>
  </motion.div>
  );
};

const LearnMorePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-background-dark">
      <Navbar />
      <main className="flex-grow container-app py-16 sm:py-24">
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="container-app"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">Unlock the Benefits of Ride Sharing</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Discover how RideBooker makes travel better for everyone involved – safer journeys for passengers and great opportunities for drivers.
            </p>
          </motion.div>

          {/* Updated: Grid layout for sections */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Section for Passengers */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mr-4">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">For Passengers: Travel Smarter, Safer</h2>
              </div>
              <div className="space-y-6">
                {passengerBenefits.map((benefit, index) => (
                  <BenefitCard
                    key={index}
                    icon={benefit.icon}
                    title={benefit.title}
                    description={benefit.description}
                    detailedDescription={benefit.detailedDescription}
                    iconBgColor="bg-indigo-100"
                    iconTextColor="text-indigo-600"
                  />
                ))}
              </div>
            </motion.div>

            {/* Section for Drivers */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mr-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">For Drivers: Earn More, Drive Securely</h2>
              </div>
              <div className="space-y-6">
                {driverBenefits.map((benefit, index) => (
                  <BenefitCard
                    key={index}
                    icon={benefit.icon}
                    title={benefit.title}
                    description={benefit.description}
                    detailedDescription={benefit.detailedDescription}
                    iconBgColor="bg-purple-100"
                    iconTextColor="text-purple-600"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div variants={fadeInUp} className="text-center mt-16 lg:mt-20">
            <p className="text-xl text-gray-700 mb-6">Ready to experience the benefits?</p>
            <motion.div whileTap={{ scale: 0.95 }}>
              <a
                href="/become-member"
                className="btn btn-primary"
              >
                Become a Member
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default LearnMorePage;