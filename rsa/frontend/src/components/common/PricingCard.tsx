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
          bg: 'bg-primary',
          bgLight: 'bg-primary/10',
          border: 'border-primary',
          text: 'text-primary',
          hover: 'hover:bg-primary-dark',
        };
      case 'green':
        return {
          bg: 'bg-secondary',
          bgLight: 'bg-secondary/10',
          border: 'border-secondary',
          text: 'text-secondary',
          hover: 'hover:bg-secondary-dark',
        };
      case 'purple':
        return {
          bg: 'bg-purple',
          bgLight: 'bg-purple/10',
          border: 'border-purple',
          text: 'text-purple',
          hover: 'hover:bg-purple-dark',
        };
      case 'red':
        return {
          bg: 'bg-accent',
          bgLight: 'bg-accent/10',
          border: 'border-accent',
          text: 'text-accent',
          hover: 'hover:bg-accent-dark',
        };
      default:
        return {
          bg: 'bg-primary',
          bgLight: 'bg-primary/10',
          border: 'border-primary',
          text: 'text-primary',
          hover: 'hover:bg-primary-dark',
        };
    }
  };

  const accentColors = getAccentColorClasses();

  return (
    <div
      className={`card card-interactive relative flex flex-col overflow-hidden ${
        tier.popular
          ? 'border-2 border-primary shadow-lg ring-2 ring-primary/20'
          : ''
      } ${className}`}
    >
      {tier.popular && (
        <div className="absolute top-0 right-0">
          <div className="w-20 h-20 relative">
            <div className="absolute transform rotate-45 bg-primary text-black text-xs font-semibold py-1 right-[-35px] top-[32px] w-[170px] text-center">
              Most Popular
            </div>
          </div>
        </div>
      )}

      <div className={`${accentColors.bgLight} p-6`}>
        <h3 className="text-xl font-bold text-light-primary dark:text-dark-primary mb-2">{tier.title}</h3>
        <div className="flex items-end mb-2">
          <span className="text-3xl font-bold text-light-primary dark:text-dark-primary">${tier.price}</span>
          {tier.period && (
            <span className="text-sm text-light-tertiary dark:text-dark-tertiary ml-1">/{tier.period}</span>
          )}
        </div>
        <p className="text-sm text-light-secondary dark:text-dark-secondary">{tier.description}</p>
      </div>

      <div className="p-6 flex-grow">
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <Check className={`h-5 w-5 ${accentColors.text} mr-2 flex-shrink-0`} />
              ) : (
                <X className="h-5 w-5 text-light-tertiary dark:text-dark-tertiary mr-2 flex-shrink-0" />
              )}
              <span className={feature.included ? 'text-light-primary dark:text-dark-primary' : 'text-light-tertiary dark:text-dark-tertiary'}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 pt-0">
        <button
          onClick={handleSelect}
          className={`btn w-full ${
            tier.popular
              ? 'btn-primary'
              : 'btn-secondary'
          }`}
        >
          {tier.callToAction}
        </button>
      </div>
    </div>
  );
};

export default PricingCard; 