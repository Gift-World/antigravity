// src/components/ui/AntigravityLogo.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface AntigravityLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  textColor?: string;
}

export const AntigravityLogo: React.FC<AntigravityLogoProps> = ({
  className,
  size = 'md',
  showText = true,
  textColor = 'text-white',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    hero: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm tracking-wider',
    md: 'text-lg tracking-wider',
    lg: 'text-xl tracking-widest',
    hero: 'text-2xl tracking-widest',
  };

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none font-display', className)}>
      {/* Stylized A Icon with Upward Force Arrow Crossbar */}
      <div
        className={cn(
          'rounded-xl bg-ag-surface border border-ag-blue/40 flex items-center justify-center shrink-0 shadow-lg shadow-ag-blue/10 transition-transform group-hover:scale-105',
          iconSizes[size]
        )}
      >
        <svg className="w-[70%] h-[70%]" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="agBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#448AFF" />
              <stop offset="100%" stopColor="#00E676" />
            </linearGradient>
          </defs>
          {/* Stylized outer A frame */}
          <path
            d="M50 14 L20 84 L36 84 L44 64 L56 64 L64 84 L80 84 Z"
            stroke="url(#agBrandGrad)"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Crossbar stylized as upward arrow against gravity */}
          <path d="M50 34 L50 64" stroke="url(#agBrandGrad)" strokeWidth="6" strokeLinecap="round" />
          <path
            d="M40 45 L50 34 L60 45"
            stroke="url(#agBrandGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-bold tracking-tight', textColor, textSizes[size])}>
            ANTIGRAVITY
          </span>
          <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-ag-green uppercase mt-0.5">
            CROWD INTELLIGENCE
          </span>
        </div>
      )}
    </div>
  );
};
