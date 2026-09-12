'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (rawVal === '') return;
    const newValue = parseInt(rawVal, 10);
    if (!isNaN(newValue)) {
      if (newValue < 1) onChange(1);
      else if (newValue > max) onChange(max);
      else onChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground/60 w-16 shrink-0">Số lượng</span>

      <div className="flex items-center h-9 border border-border rounded-lg overflow-hidden bg-card">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDecrement}
          disabled={value <= 1}
          className="w-9 h-full rounded-none text-muted-foreground hover:text-foreground"
          aria-label="Giảm số lượng"
        >
          <Minus className="w-3.5 h-3.5" />
        </Button>

        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleInputChange}
          className="w-12 h-full text-center text-sm font-bold border-0 border-x border-border rounded-none shadow-none focus-visible:ring-0 bg-transparent p-0"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onIncrement}
          disabled={value >= max}
          className="w-9 h-full rounded-none text-muted-foreground hover:text-foreground"
          aria-label="Tăng số lượng"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
        <span>{max} sản phẩm có sẵn</span>
        <span className="text-muted-foreground/50">|</span>
        <span>Dự kiến giao 3-5 ngày</span>
      </div>
    </div>
  );
}

export default QuantitySelector;
