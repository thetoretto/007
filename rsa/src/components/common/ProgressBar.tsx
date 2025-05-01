import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  numbered?: boolean;
}

type StepType = string | Step;

interface ProgressBarProps {
  steps: StepType[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex flex-col items-center group ${ // Added group for hover state
              onStepClick && index < currentStep ? 'cursor-pointer' : 'cursor-default'
            }`}
            onClick={() => {
              if (onStepClick && index < currentStep) {
                onStepClick(index + 1);
              }
            }}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 transition-all duration-200 ease-in-out ${ // Added transition
                onStepClick && index < currentStep ? 'group-hover:scale-110 group-hover:shadow-md' : '' // Added hover effect for clickable steps
              } ${
                index + 1 < currentStep
                  ? 'bg-success-500 text-white'
                  : index + 1 === currentStep
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1 < currentStep ? (
                <Check className="w-6 h-6" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            <span
              className={`text-xs font-medium text-center transition-colors duration-200 ${ // Added transition
                onStepClick && index < currentStep ? 'group-hover:text-primary-600' : '' // Added hover effect for clickable steps
              } ${
                index + 1 <= currentStep ? 'text-gray-800' : 'text-gray-500'
              }`}
            >
              {typeof step === 'string' ? step : step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="h-1 w-full bg-gray-200 rounded"></div>
        </div>
        <div
          className="absolute inset-0 flex items-center"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        >
          <div className="h-1 w-full bg-primary-500 rounded transition-all duration-300"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;