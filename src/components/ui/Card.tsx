import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'outlined';
  elevation?: 'level-0' | 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'elevated', elevation = 'level-1', children, ...props }, ref) => {
    const baseClasses = [
      'rounded-xl transition-all duration-200',
    ];

    const variantClasses = {
      elevated: [
        'bg-surface-container',
        elevation === 'level-0' && 'shadow-none',
        elevation === 'level-1' && 'shadow-sm',
        elevation === 'level-2' && 'shadow-md',
        elevation === 'level-3' && 'shadow-lg',
        elevation === 'level-4' && 'shadow-xl',
        elevation === 'level-5' && 'shadow-2xl',
        'hover:shadow-lg',
      ],
      filled: [
        'bg-surface-container',
      ],
      outlined: [
        'bg-surface-container border border-outline',
      ],
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 pb-0', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 pt-0 flex gap-2', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardActions.displayName = 'CardActions';

export { Card, CardHeader, CardContent, CardActions }; 