// src/components/ui/Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-ag-blue/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-brand-gradient text-white shadow-lg shadow-ag-blue/20 hover:shadow-ag-blue/30 hover:brightness-110 border border-ag-blue/30 font-semibold',
      secondary:
        'bg-ag-surface text-ag-text-primary hover:bg-ag-surface-hover border border-ag-border hover:border-ag-text-secondary/40 shadow-sm',
      danger:
        'bg-ag-red text-white hover:bg-ag-red/90 shadow-lg shadow-ag-red/20 border border-ag-red/30',
      success:
        'bg-ag-green text-ag-black font-semibold hover:brightness-110 shadow-lg shadow-ag-green/20',
      outline:
        'bg-transparent border border-ag-border text-ag-text-primary hover:bg-ag-surface hover:border-ag-blue/40',
      ghost:
        'bg-transparent text-ag-text-secondary hover:text-ag-text-primary hover:bg-ag-surface-hover',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-6 py-3 gap-2.5 h-12 font-semibold',
      icon: 'p-2 h-9 w-9',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
