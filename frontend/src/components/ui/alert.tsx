import React from 'react';
import { cn } from '../../utils/cn';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error' | 'default' | 'destructive';
  className?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
  title?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  default: 'alert-info',
  destructive: 'alert-error',
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error'
};

const iconClasses = {
  default: 'text-blue-600',
  destructive: 'text-red-600',
  info: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600'
};

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'default', 
  className = '',
  onClose,
  icon,
  title
}) => {
  return (
    <div className={cn('alert', variantClasses[variant], className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className={cn('flex-shrink-0 mt-0.5', iconClasses[variant])}>
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium mb-1">
              {title}
            </h4>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={cn('text-sm leading-relaxed', className)}>
      {children}
    </div>
  );
};