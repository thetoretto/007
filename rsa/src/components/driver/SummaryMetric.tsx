import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryMetricProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'primary' | 'success' | 'accent' | 'warning';
  animate?: boolean;
}

const SummaryMetric: React.FC<SummaryMetricProps> = ({
  title,
  value,
  icon: Icon,
  color,
  animate = true,
}) => {
  const colorClasses = {
    primary: 'text-primary-600',
    success: 'text-success-600',
    accent: 'text-accent-600',
    warning: 'text-warning-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full bg-${color}-100`}>
          <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p
            className={`
              mt-1 text-2xl font-bold ${colorClasses[color]}
              ${animate ? 'animate-count-up' : ''}
            `}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryMetric;