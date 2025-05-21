import React from 'react';
import { Check, X } from 'lucide-react';

export interface PricingTier {
  title: string;
  price: number;
  period?: string;
  description: string;
  features: {
    text: string;
    included: boolean;
  }[];
  accentColor?: string;
  callToAction: string;
  popular?: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
  onSelect?: (tier: PricingTier) => void;
  className?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  onSelect,
  className = '',
}) => {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(tier);
    }
  };

  // Choose accent color styles based on props or fallback to primary
  const getAccentColorClasses = () => {
    switch (tier.accentColor) {
      case 'yellow':
        return {
          bg: 'bg-accent-yellow',
          bgLight: 'bg-accent-yellow/10',
          border: 'border-accent-yellow',
          text: 'text-accent-yellow',
          hover: 'hover:bg-accent-yellow/80',
        };
      case 'green':
        return {
          bg: 'bg-accent-green',
          bgLight: 'bg-accent-green/10',
          border: 'border-accent-green',
          text: 'text-accent-green',
          hover: 'hover:bg-accent-green/80',
        };
      case 'purple':
        return {
          bg: 'bg-accent-purple',
          bgLight: 'bg-accent-purple/10',
          border: 'border-accent-purple',
          text: 'text-accent-purple',
          hover: 'hover:bg-accent-purple/80',
        };
      case 'red':
        return {
          bg: 'bg-accent-red',
          bgLight: 'bg-accent-red/10',
          border: 'border-accent-red',
          text: 'text-accent-red',
          hover: 'hover:bg-accent-red/80',
        };
      default:
        return {
          bg: 'bg-primary',
          bgLight: 'bg-primary/10',
          border: 'border-primary',
          text: 'text-primary-800 dark:text-primary-200',
          hover: 'hover:bg-primary-800 dark:hover:bg-primary-700',
        };
    }
  };

  const accentColors = getAccentColorClasses();

  return (
    <div 
      className={`relative flex flex-col rounded-xl overflow-hidden ${
        tier.popular 
          ? 'shadow-lg border-2 border-primary dark:border-primary-300' 
          : 'shadow-md border border-gray-200 dark:border-primary-900'
      } bg-background-light dark:bg-section-dark ${className}`}
    >
      {tier.popular && (
        <div className="absolute top-0 right-0">
          <div className="w-20 h-20 relative">
            <div className="absolute transform rotate-45 bg-primary dark:bg-primary-300 text-white text-xs font-semibold py-1 right-[-35px] top-[32px] w-[170px] text-center">
              Most Popular
            </div>
          </div>
        </div>
      )}

      <div className={`${accentColors.bgLight} dark:bg-opacity-20 p-6`}>
        <h3 className="text-xl font-bold text-accent-black dark:text-text-inverse mb-2">{tier.title}</h3>
        <div className="flex items-end mb-2">
          <span className="text-3xl font-bold text-accent-black dark:text-text-inverse">${tier.price}</span>
          {tier.period && (
            <span className="text-sm text-text-muted dark:text-gray-400 ml-1">/{tier.period}</span>
          )}
        </div>
        <p className="text-sm text-text-base dark:text-gray-300">{tier.description}</p>
      </div>

      <div className="p-6 flex-grow">
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <Check className={`h-5 w-5 ${accentColors.text} mr-2 flex-shrink-0`} />
              ) : (
                <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span className={feature.included ? 'text-text-base dark:text-text-inverse' : 'text-text-muted dark:text-gray-400'}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 pt-0">
        <button
          onClick={handleSelect}
          className={`w-full px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            tier.popular 
              ? `${accentColors.bg} text-text-base dark:text-text-inverse ${accentColors.hover}`
              : 'bg-background-alternate dark:bg-background-darkAlternate text-text-base dark:text-text-inverse hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {tier.callToAction}
        </button>
      </div>
    </div>
  );
};

export default PricingCard; 