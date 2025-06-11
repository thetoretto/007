import React from 'react';

interface SettingsSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SettingsSelectProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: SettingsSelectOption[];
  disabled?: boolean;
  required?: boolean;
}

const SettingsSelect: React.FC<SettingsSelectProps> = ({
  label,
  description,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-light-tertiary dark:text-dark-tertiary">
          {description}
        </p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="form-input w-full"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SettingsSelect;
