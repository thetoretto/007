import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';

interface FloatingThemeToggleProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const FloatingThemeToggle: React.FC<FloatingThemeToggleProps> = ({ 
  position = 'bottom-right' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex items-center transition-all duration-300 ease-in-out`}>
      {isExpanded ? (
        <div className="flex items-center space-x-3 bg-light dark:bg-dark rounded-full p-2 shadow-lg border border-primary-300 dark:border-primary-800">
          <ThemeToggle size="md" showLabel={true} />
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 rounded-full hover:bg-primary-100 dark:hover:bg-primary/20"
            aria-label="Collapse theme toggle"
          >
            {position.includes('right') ? (
              <ArrowRightCircle className="h-5 w-5 text-primary-800 dark:text-primary-200" />
            ) : (
              <ArrowLeftCircle className="h-5 w-5 text-primary-800 dark:text-primary-200" />
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="rounded-full bg-background-light dark:bg-background-dark p-2 shadow-md border border-primary-300 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/20"
          aria-label="Expand theme toggle"
        >
          {position.includes('right') ? (
            <ArrowLeftCircle className="h-5 w-5 text-primary-800 dark:text-primary-200" />
          ) : (
            <ArrowRightCircle className="h-5 w-5 text-primary-800 dark:text-primary-200" />
          )}
        </button>
      )}
    </div>
  );
};

export default FloatingThemeToggle; 