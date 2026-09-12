'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StarRatingProps {
  value: number;
  max?: number;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeConfig = {
  sm: { icon: 'h-3.5 w-3.5', text: 'text-xs' },
  md: { icon: 'h-4 w-4', text: 'text-sm' },
  lg: { icon: 'h-6 w-6', text: 'text-base' },
};

export function StarRating({
  value,
  max = 5,
  readOnly = true,
  size = 'md',
  showValue = false,
  count,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const currentConfig = sizeConfig[size];
  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = displayValue >= starNumber;
          const isHalf = !isFilled && displayValue >= starNumber - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onChange?.(starNumber)}
              onMouseEnter={() => !readOnly && setHoverValue(starNumber)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              className={cn(
                'relative transition-transform duration-100 focus:outline-none',
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
              )}
            >
              <Star
                className={cn(
                  currentConfig.icon,
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'fill-muted text-muted-foreground/40',
                )}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={cn('font-semibold text-foreground', currentConfig.text)}>
          {value.toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className={cn('text-muted-foreground', currentConfig.text)}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
