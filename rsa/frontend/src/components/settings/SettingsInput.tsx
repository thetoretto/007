import React from 'react';

interface SettingsInputProps {
  label: string;
  description?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'time';
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

const SettingsInput: React.FC<SettingsInputProps> = ({
  label,
  description,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  min,
  max,
  step,
  required = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

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
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        required={required}
        className="form-input w-full"
      />
    </div>
  );
};

export default SettingsInput;
