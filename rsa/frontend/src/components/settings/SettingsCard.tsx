import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className = '',
}) => {
  return (
    <div className={`driver-metric-card ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="icon-badge icon-badge-md bg-primary-light text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default SettingsCard;
