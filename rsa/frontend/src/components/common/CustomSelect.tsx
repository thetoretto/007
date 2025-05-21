import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  name?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  name,
  required = false,
  error,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    options.find(option => option.value === value)
  );
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedOption(options.find(option => option.value === value));
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const selectedDisplay = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div
        ref={selectRef}
        className={`relative ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <div
          onClick={toggleDropdown}
          className={`flex items-center justify-between px-3 py-2 rounded-md border w-full cursor-pointer ${
            isOpen 
              ? 'border-primary-400 ring-1 ring-primary-400 dark:border-primary-300 dark:ring-primary-300' 
              : 'border-primary-200 dark:border-primary-800'
          } ${
            error ? 'border-error dark:border-error' : ''
          } ${
            disabled 
              ? 'bg-gray-100 dark:bg-gray-800' 
              : 'bg-background-light dark:bg-section-dark hover:bg-primary-50 dark:hover:bg-primary-900/20'
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          role="combobox"
        >
          <span className={`block truncate ${selectedOption ? 'text-text-base dark:text-text-inverse' : 'text-gray-400 dark:text-gray-500'}`}>
            {selectedDisplay}
          </span>
          <ChevronDown className={`h-5 w-5 text-primary dark:text-primary-300 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md shadow-lg">
            <ul 
              className="max-h-60 rounded-md py-1 bg-background-light dark:bg-section-dark border border-primary-200 dark:border-primary-800 text-base shadow-lg overflow-auto focus:outline-none sm:text-sm"
              role="listbox"
            >
              {options.length === 0 ? (
                <li className="py-2 px-3 text-gray-400 dark:text-gray-500">No options available</li>
              ) : (
                options.map((option) => {
                  const isSelected = selectedOption?.value === option.value;
                  return (
                    <li
                      key={option.value}
                      className={`py-2 px-3 flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200' 
                          : 'text-text-base dark:text-text-inverse hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}
                      onClick={() => handleSelect(option)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="block truncate">{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
      
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
};

export default CustomSelect; 