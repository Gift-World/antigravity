// src/components/ui/Badge.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'purple' | 'neutral';
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  pulse = false,
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    green: 'bg-ag-green-dim text-ag-green border-ag-green/30',
    yellow: 'bg-ag-yellow-dim text-ag-yellow border-ag-yellow/30',
    orange: 'bg-ag-orange-dim text-ag-orange border-ag-orange/30',
    red: 'bg-ag-red-dim text-ag-red border-ag-red/30',
    blue: 'bg-ag-blue-dim text-ag-blue border-ag-blue/30',
    purple: 'bg-ag-purple-dim text-ag-purple border-ag-purple/30',
    neutral: 'bg-ag-surface text-ag-text-secondary border-ag-border',
  };

  const dotColors = {
    green: 'bg-ag-green',
    yellow: 'bg-ag-yellow',
    orange: 'bg-ag-orange',
    red: 'bg-ag-red',
    blue: 'bg-ag-blue',
    purple: 'bg-ag-purple',
    neutral: 'bg-ag-text-muted',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase font-mono',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              dotColors[variant]
            )}
          />
          <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColors[variant])} />
        </span>
      )}
      {children}
    </span>
  );
};
