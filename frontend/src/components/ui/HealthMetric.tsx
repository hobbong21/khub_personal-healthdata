import React from 'react';
import { cn } from '../../utils/cn';

interface HealthMetricProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  description?: string;
  className?: string;
}

const statusConfig = {
  normal: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-200'
  },
  warning: {
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-200'
  },
  critical: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-red-600',
    borderColor: 'border-red-200'
  }
};

const trendConfig = {
  up: { icon: '↗', color: 'text-green-600' },
  down: { icon: '↘', color: 'text-red-600' },
  stable: { icon: '→', color: 'text-gray-600' }
};

export function HealthMetric({
  title,
  value,
  unit,
  icon,
  status = 'normal',
  trend,
  trendValue,
  description,
  className
}: HealthMetricProps) {
  const config = statusConfig[status];
  
  return (
    <div className={cn(
      'health-metric',
      `health-metric-${status}`,
      className
    )}>
      {icon && (
        <div className={cn(
          'health-metric-icon',
          config.iconBg,
          config.iconColor
        )}>
          {icon}
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-secondary">
            {title}
          </h4>
          
          {trend && trendValue && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              trendConfig[trend].color
            )}>
              <span>{trendConfig[trend].icon}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-secondary">
              {unit}
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-tertiary mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// 건강 메트릭 그리드 컴포넌트
interface HealthMetricGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function HealthMetricGrid({ 
  children, 
  columns = 2, 
  className 
}: HealthMetricGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  return (
    <div className={cn(
      'grid gap-4',
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
}