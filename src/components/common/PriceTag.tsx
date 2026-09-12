'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PriceTagProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscountBadge?: boolean;
  className?: string;
}

export function formatCurrency(amount: number, currency: string = 'VND'): string {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

const sizeClasses = {
  sm: {
    price: 'text-sm font-semibold',
    originalPrice: 'text-xs text-muted-foreground line-through',
    badge: 'text-[10px] px-1 py-0',
  },
  md: {
    price: 'text-base font-bold',
    originalPrice: 'text-sm text-muted-foreground line-through',
    badge: 'text-xs px-1.5 py-0.5',
  },
  lg: {
    price: 'text-xl font-bold',
    originalPrice: 'text-sm text-muted-foreground line-through',
    badge: 'text-xs px-2 py-0.5',
  },
  xl: {
    price: 'text-2xl sm:text-3xl font-extrabold',
    originalPrice: 'text-base sm:text-lg text-muted-foreground line-through',
    badge: 'text-sm px-2.5 py-1',
  },
};

export function PriceTag({
  price,
  originalPrice,
  currency = 'VND',
  size = 'md',
  showDiscountBadge = true,
  className,
}: PriceTagProps) {
  const currentSize = sizeClasses[size];
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className={cn('inline-flex flex-wrap items-baseline gap-2', className)}>
      <span className={cn('text-primary tracking-tight', currentSize.price)}>
        {formatCurrency(price, currency)}
      </span>

      {hasDiscount && (
        <>
          <span className={cn(currentSize.originalPrice)}>
            {formatCurrency(originalPrice, currency)}
          </span>
          {showDiscountBadge && discountPercent > 0 && (
            <Badge variant="destructive" className={cn('font-bold', currentSize.badge)}>
              -{discountPercent}%
            </Badge>
          )}
        </>
      )}
    </div>
  );
}
