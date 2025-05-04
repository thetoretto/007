import { ReactNode } from 'react';

type Metric = {
  label: string;
  value: string | number;
  icon: ReactNode;
  colorClass: string;
};

type DailySummaryProps = {
  metrics: Metric[];
  className?: string;
};

export const DailySummary = ({ metrics, className }: DailySummaryProps) => (
  <div className={`grid grid-cols-2 gap-4 ${className}`}>
    {metrics.map((metric, index) => (
      <div key={index} className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center">
          <div className={`${metric.colorClass} p-2 rounded-md mr-3`}>
            {metric.icon}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
            <p className="text-2xl font-bold">{metric.value}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);