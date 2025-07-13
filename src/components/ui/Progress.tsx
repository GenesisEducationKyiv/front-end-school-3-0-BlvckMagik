import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'linear' | 'circular';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    variant = 'linear',
    size = 'medium',
    color = 'primary',
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    if (variant === 'circular') {
      const radius = size === 'small' ? 16 : size === 'large' ? 32 : 24;
      const strokeWidth = size === 'small' ? 2 : size === 'large' ? 4 : 3;
      const circumference = 2 * Math.PI * radius;
      const strokeDasharray = circumference;
      const strokeDashoffset = circumference - (percentage / 100) * circumference;

      return (
        <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
          <svg
            className="transform -rotate-90"
            width={radius * 2 + strokeWidth}
            height={radius * 2 + strokeWidth}
          >
            <circle
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-surface-container"
            />
            <circle
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                'transition-all duration-300 ease-in-out',
                color === 'primary' && 'text-primary',
                color === 'secondary' && 'text-secondary',
                color === 'error' && 'text-error'
              )}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'text-xs font-medium',
              size === 'small' && 'text-xs',
              size === 'large' && 'text-sm',
              'text-on-surface'
            )}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      );
    }

    const sizeClasses = {
      small: 'h-1',
      medium: 'h-2',
      large: 'h-3',
    };

    const colorClasses = {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      error: 'bg-error',
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className={cn(
          'w-full bg-surface-container rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          <div
            className={cn(
              'h-full transition-all duration-300 ease-in-out rounded-full',
              colorClasses[color]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress }; 