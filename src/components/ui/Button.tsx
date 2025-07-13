import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'filled', 
    size = 'medium', 
    disabled = false, 
    loading = false,
    startIcon,
    endIcon,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ];

    const variantClasses = {
      filled: [
        'bg-primary text-on-primary shadow-sm',
        'hover:bg-primary-hover hover:shadow-md',
        'focus:ring-primary/20',
        'active:bg-primary-pressed',
      ],
      outlined: [
        'border border-outline text-primary',
        'hover:bg-primary-container hover:text-on-primary-container',
        'focus:ring-primary/20',
        'active:bg-primary-container-pressed',
      ],
      text: [
        'text-primary',
        'hover:bg-primary-container hover:text-on-primary-container',
        'focus:ring-primary/20',
        'active:bg-primary-container-pressed',
      ],
      elevated: [
        'bg-surface-container text-primary shadow-sm',
        'hover:bg-surface-container-hover hover:shadow-md',
        'focus:ring-primary/20',
        'active:bg-surface-container-pressed',
      ],
      tonal: [
        'bg-secondary-container text-on-secondary-container',
        'hover:bg-secondary-container-hover',
        'focus:ring-secondary/20',
        'active:bg-secondary-container-pressed',
      ],
    };

    const sizeClasses = {
      small: 'h-8 px-12 text-sm',
      medium: 'h-10 px-16 text-sm',
      large: 'h-12 px-20 text-base',
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!loading && startIcon && (
          <span className="mr-2">{startIcon}</span>
        )}
        {children}
        {endIcon && (
          <span className="ml-2">{endIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 