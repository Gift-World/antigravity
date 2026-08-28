// src/components/ui/FlipCounter.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FlipCounterProps {
  value: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const FlipCounter: React.FC<FlipCounterProps> = ({
  value,
  max,
  label,
  size = 'lg',
}) => {
  const [prevValue, setPrevValue] = useState(value);
  const isIncreasing = value >= prevValue;

  useEffect(() => {
    setPrevValue(value);
  }, [value]);

  const formattedStr = new Intl.NumberFormat('en-KE').format(value);
  const maxFormatted = max ? new Intl.NumberFormat('en-KE').format(max) : null;

  const fontSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    hero: 'text-5xl sm:text-6xl',
  };

  return (
    <div className="flex flex-col items-start font-mono">
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ag-text-secondary mb-1">
          {label}
        </span>
      )}
      <div className="flex items-baseline gap-2">
        <div className="relative inline-flex items-center overflow-hidden h-fit">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={{ y: isIncreasing ? 18 : -18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: isIncreasing ? -18 : 18, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`font-display font-bold tracking-tight text-ag-text-primary ${fontSizes[size]}`}
            >
              {formattedStr}
            </motion.span>
          </AnimatePresence>
        </div>
        {maxFormatted && (
          <span className="text-ag-text-muted font-display text-sm sm:text-base font-semibold">
            / {maxFormatted}
          </span>
        )}
      </div>
    </div>
  );
};
