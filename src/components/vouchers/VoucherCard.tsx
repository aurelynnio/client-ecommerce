'use client';

import React from 'react';
import { Ticket, Store, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Voucher } from '@/types/voucher';
import { cn } from '@/utils/cn';

interface VoucherCardProps {
  voucher: Voucher;
  isCollected?: boolean;
  onCollect?: (id: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function VoucherCard({
  voucher,
  isCollected,
  onCollect,
  className,
  variant = 'default',
}: VoucherCardProps) {
  const formatValue = () => {
    if (voucher.type === 'percentage') {
      return `${voucher.value}%`;
    }
    return `₫${voucher.value.toLocaleString('vi-VN')}`;
  };

  const usagePercent = Math.min(100, Math.round((voucher.usageCount / voucher.usageLimit) * 100));

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(voucher.code);
    toast.success(`Đã sao chép mã: ${voucher.code}`);
  };

  const isPlatform = voucher.scope === 'platform';
  const accentColor = isPlatform ? 'text-primary' : 'text-info';
  const accentBg = isPlatform ? 'bg-primary' : 'bg-info';

  // Compact variant for daily vouchers grid
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/30',
          className,
        )}
      >
        {/* Discount Badge */}
        <div className={cn('bg-muted px-3 py-3 text-center')}>
          <div className={cn('text-xl font-bold', accentColor)}>{formatValue()}</div>
          <div className="text-xs text-muted-foreground">
            {voucher.type === 'percentage' ? 'Giảm' : 'Giảm'}
          </div>
        </div>

        {/* Dotted Separator */}
        <div className="relative">
          <div className="absolute left-0 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted" />
          <div className="absolute right-0 top-0 size-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-muted" />
          <div className="border-t border-dashed border-border" />
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">{voucher.name}</p>

          {isCollected ? (
            <div className="flex items-center justify-center gap-1 rounded-lg bg-muted py-1.5 text-xs text-muted-foreground">
              <Check className="w-3 h-3" />
              Đã lưu
            </div>
          ) : (
            <button
              onClick={() => onCollect?.(voucher._id)}
              className={cn(
                'w-full py-1.5 rounded-lg text-white text-xs font-medium transition-opacity hover:opacity-90',
                accentBg,
              )}
            >
              Lưu
            </button>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <div
        className={cn(
          'flex overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/30',
          className,
        )}
      >
        {/* Left - Value Section */}
        <div
          className={cn(
            'relative flex w-24 shrink-0 flex-col items-center justify-center bg-muted p-3',
          )}
        >
          {/* Punch-out circles */}
          <div className="absolute right-0 top-0 size-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-muted" />
          <div className="absolute bottom-0 right-0 size-3 translate-x-1/2 translate-y-1/2 rounded-full bg-muted" />

          <span className={cn('text-lg font-bold', accentColor)}>{formatValue()}</span>
          <span className="text-[10px] text-muted-foreground">
            {isPlatform ? 'Toàn sàn' : 'Cửa hàng'}
          </span>
        </div>

        {/* Right - Info Section */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="line-clamp-1 text-sm font-medium text-foreground">{voucher.name}</h3>
              <button
                onClick={handleCopyCode}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Sao chép mã ${voucher.code}`}
              >
                <Copy size={12} />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Đơn tối thiểu ₫{voucher.minOrderValue.toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            {/* Progress */}
            <div className="flex-1">
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full', accentBg)}
                  style={{ width: `${usagePercent}%`, opacity: 0.7 }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground">Đã dùng {usagePercent}%</span>
            </div>

            {isCollected ? (
              <span className="text-[10px] font-medium text-success">Đã Lưu</span>
            ) : (
              <button
                onClick={() => onCollect?.(voucher._id)}
                className={cn(
                  'text-[10px] font-medium px-3 py-1 rounded-lg text-white transition-opacity hover:opacity-90',
                  accentBg,
                )}
              >
                Lưu
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default Card Variant - Rustic Style
  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/30',
        className,
      )}
    >
      {/* Header with discount value */}
      <div className="relative bg-muted px-4 py-5 text-center">
        {/* Scope badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {isPlatform ? (
            <Ticket size={12} className={accentColor} />
          ) : (
            <Store size={12} className={accentColor} />
          )}
          <span className={cn('text-[10px] font-medium', accentColor)}>
            {isPlatform ? 'Toàn sàn' : 'Cửa hàng'}
          </span>
        </div>

        {/* Discount value */}
        <div className={cn('text-3xl font-bold tracking-tight', accentColor)}>{formatValue()}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {voucher.type === 'percentage' ? 'Giảm' : 'Giảm trực tiếp'}
        </div>
      </div>

      {/* Dotted divider with punch-out effect */}
      <div className="relative">
        <div className="absolute left-0 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted" />
        <div className="absolute right-0 top-0 size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-muted" />
        <div className="border-t border-dashed border-border" />
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {voucher.name}
          </h3>

          <div className="space-y-1 text-[11px] text-muted-foreground">
            <p>
              Mã: <span className="font-medium text-foreground">{voucher.code}</span>
            </p>
            <p>Đơn tối thiểu: ₫{voucher.minOrderValue.toLocaleString('vi-VN')}</p>
            <p>HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        {/* Usage progress */}
        <div className="mt-4 mb-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Đã sử dụng</span>
            <span>{usagePercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-[width]', accentBg)}
              style={{ width: `${usagePercent}%`, opacity: 0.8 }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyCode}
            className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Copy size={12} />
            Sao chép
          </button>

          {isCollected ? (
            <div className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-success/15 text-xs font-medium text-success">
              <Check size={12} />
              Đã lưu
            </div>
          ) : (
            <button
              onClick={() => onCollect?.(voucher._id)}
              className={cn(
                'flex-1 h-9 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90',
                accentBg,
              )}
            >
              Lưu ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
