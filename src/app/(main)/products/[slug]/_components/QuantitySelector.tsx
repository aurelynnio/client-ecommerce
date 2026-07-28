'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuantitySelectorProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function QuantitySelector({
  value,
  max,
  onChange,
  onIncrement,
  onDecrement,
}: QuantitySelectorProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-400 w-16 shrink-0">Số lượng</span>

      <div className="flex items-center h-9 border border-border rounded-lg overflow-hidden">
        <button
          onClick={onDecrement}
          disabled={value <= 1}
          className={cn(
            'w-9 h-full flex items-center justify-center bg-muted/30 text-muted-foreground hover:text-foreground transition-colors',
            value <= 1 && 'opacity-30 cursor-not-allowed',
          )}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={1}
          max={max}
          className="w-12 h-full text-center text-sm font-bold border-x border-border focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent"
        />

        <button
          onClick={onIncrement}
          disabled={value >= max}
          className={cn(
            'w-9 h-full flex items-center justify-center bg-muted/30 text-muted-foreground hover:text-foreground transition-colors',
            value >= max && 'opacity-30 cursor-not-allowed',
          )}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{max} sản phẩm có sẵn</span>
        <span className="text-gray-300">|</span>
        <span>Dự kiến giao 3-5 ngày</span>
      </div>
    </div>
  );
}

export default QuantitySelector;
