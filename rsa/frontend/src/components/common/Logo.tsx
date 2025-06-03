import React from 'react';
import { Bus } from 'lucide-react';

interface LogoProps {
  variant?: 'white' | 'black' | 'primary' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  // Size configurations
  const sizeConfig = {
    sm: { icon: 'h-5 w-5', text: 'text-sm' },
    md: { icon: 'h-6 w-6', text: 'text-lg' },
    lg: { icon: 'h-8 w-8', text: 'text-xl' },
    xl: { icon: 'h-10 w-10', text: 'text-2xl' }
  };

  // Color configurations
  const colorConfig = {
    white: {
      icon: 'text-white',
      text: 'text-white'
    },
    black: {
      icon: 'text-black',
      text: 'text-black'
    },
    primary: {
      icon: 'text-primary-600 dark:text-primary-400',
      text: 'text-primary-800 dark:text-primary-200'
    },
    dark: {
      icon: 'text-gray-900 dark:text-gray-100',
      text: 'text-gray-900 dark:text-gray-100'
    },
    light: {
      icon: 'text-gray-600 dark:text-gray-300',
      text: 'text-gray-600 dark:text-gray-300'
    }
  };

  const currentSize = sizeConfig[size];
  const currentColor = colorConfig[variant];

  // Try to load logo image based on variant, fallback to icon
  const logoSrc = `/src/resources/logos/${variant}.svg`;
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Try to render image logo first, fallback to icon */}
      <div className="flex-shrink-0">
        {!imageError ? (
          <img 
            src={logoSrc}
            alt="RideBooker Logo"
            className={`${currentSize.icon} object-contain`}
            onError={() => setImageError(true)}
          />
        ) : (
          <Bus className={`${currentSize.icon} ${currentColor.icon}`} />
        )}
      </div>
      
      {showText && (
        <span className={`font-bold ${currentSize.text} ${currentColor.text} whitespace-nowrap`}>
          RideBooker
        </span>
      )}
    </div>
  );
};

export default Logo;