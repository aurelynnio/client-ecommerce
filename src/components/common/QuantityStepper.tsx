'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange: (value: number) => void;
  className?: string;
}

const sizeConfig = {
  sm: {
    buttonSize: 'icon-sm' as const,
    inputHeight: 'h-8',
    inputWidth: 'w-12',
    iconSize: 'h-3.5 w-3.5',
    fontSize: 'text-xs',
  },
  md: {
    buttonSize: 'icon' as const,
    inputHeight: 'h-10',
    inputWidth: 'w-14',
    iconSize: 'h-4 w-4',
    fontSize: 'text-sm',
  },
  lg: {
    buttonSize: 'icon-lg' as const,
    inputHeight: 'h-12',
    inputWidth: 'w-16',
    iconSize: 'h-5 w-5',
    fontSize: 'text-base',
  },
};

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  size = 'md',
  onChange,
  className,
}: QuantityStepperProps) {
  const currentSize = sizeConfig[size];

  const handleDecrease = () => {
    if (value > min) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(Math.min(max, value + step));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (rawVal === '') {
      return;
    }
    const num = parseInt(rawVal, 10);
    if (!isNaN(num)) {
      if (num < min) onChange(min);
      else if (num > max) onChange(max);
      else onChange(num);
    }
  };

  return (
    <div className={cn('inline-flex items-center rounded-lg border border-border bg-card p-0.5', className)}>
      <Button
        type="button"
        variant="ghost"
        size={currentSize.buttonSize}
        disabled={disabled || value <= min}
        onClick={handleDecrease}
        className="rounded-md hover:bg-muted text-foreground"
        aria-label="Giảm số lượng"
      >
        <Minus className={currentSize.iconSize} />
      </Button>

      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        disabled={disabled}
        onChange={handleInputChange}
        className={cn(
          'border-0 bg-transparent text-center font-semibold shadow-none focus-visible:ring-0 p-0',
          currentSize.inputHeight,
          currentSize.inputWidth,
          currentSize.fontSize,
        )}
      />

      <Button
        type="button"
        variant="ghost"
        size={currentSize.buttonSize}
        disabled={disabled || value >= max}
        onClick={handleIncrease}
        className="rounded-md hover:bg-muted text-foreground"
        aria-label="Tăng số lượng"
      >
        <Plus className={currentSize.iconSize} />
      </Button>
    </div>
  );
}
