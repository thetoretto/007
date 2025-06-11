import React from 'react';

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="driver-trip-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-light-primary dark:text-dark-primary">
            {label}
          </h3>
          {description && (
            <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">
              {description}
            </p>
          )}
        </div>
        <div className={`driver-status-badge ${checked ? 'online' : 'offline'} cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
          />
          <div 
            onClick={() => !disabled && onChange(!checked)}
            className="flex items-center gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${checked ? 'bg-secondary animate-pulse' : 'bg-gray-400'}`}></div>
            {checked ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsToggle;
