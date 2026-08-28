// src/components/ui/Card.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: 'green' | 'red' | 'blue' | 'yellow' | 'none';
}

export const Card: React.FC<CardProps> = ({
  className,
  hover = false,
  glow = 'none',
  children,
  ...props
}) => {
  const glowStyles = {
    green: 'border-ag-green/40 shadow-[0_0_20px_rgba(0,230,118,0.15)]',
    red: 'border-ag-red/40 shadow-[0_0_20px_rgba(255,23,68,0.15)]',
    blue: 'border-ag-blue/40 shadow-[0_0_20px_rgba(68,138,255,0.15)]',
    yellow: 'border-ag-yellow/40 shadow-[0_0_20px_rgba(255,215,64,0.15)]',
    none: 'border-ag-border',
  };

  return (
    <div
      className={cn(
        'bg-ag-surface rounded-[8px] border text-ag-text-primary backdrop-blur-sm p-4 sm:p-5 transition-all duration-200',
        glowStyles[glow],
        hover && 'hover:bg-ag-surface-hover hover:border-ag-border/80 hover:shadow-md cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
