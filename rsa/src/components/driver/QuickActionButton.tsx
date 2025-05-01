import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  loading = false,
}) => {
  const baseClasses = 'btn w-full flex items-center justify-center transition-all duration-300';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:scale-[1.02]'}
        ${loading ? 'animate-pulse' : ''}
      `}
      aria-busy={loading}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
      ) : (
        <>
          <Icon className="h-5 w-5 mr-2" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export default QuickActionButton;