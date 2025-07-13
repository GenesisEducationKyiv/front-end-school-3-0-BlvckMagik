import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, error = false, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isError = Boolean(error);
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block mb-1 text-white">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full border border-white rounded p-2 bg-transparent text-white placeholder:text-white focus:border-blue-400 focus:ring-0',
            isError && 'border-red-500',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 