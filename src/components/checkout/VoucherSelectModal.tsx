'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ticket, Store, Check, AlertCircle } from 'lucide-react';
import {
  usePlatformVouchers,
  useShopVouchers,
  useSavedVouchers,
} from '@/hooks/queries';
import { Voucher } from '@/types/voucher';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/lib/utils';
import SpinnerLoading from '@/components/common/SpinnerLoading';

interface VoucherSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  scope: 'shop' | 'platform';
  shopId?: string;
  shopName?: string;
  orderTotal: number;
  selectedCode?: string;
}

export default function VoucherSelectModal({
  isOpen,
  onClose,
  onSelect,
  scope,
  shopId = '',
  shopName = 'Cửa hàng',
  orderTotal,
  selectedCode,
}: VoucherSelectModalProps) {
  const [manualCode, setManualCode] = useState('');

  // Queries
  const { data: platformVouchers = [], isLoading: loadingPlatform } = usePlatformVouchers();
  const { data: shopVouchers = [], isLoading: loadingShop } = useShopVouchers(shopId, {
    enabled: scope === 'shop' && !!shopId,
  });
  const { data: savedList = [], isLoading: loadingSaved } = useSavedVouchers({
    enabled: isOpen,
  });

  const isLoading = (scope === 'shop' ? loadingShop : loadingPlatform) || loadingSaved;

  // Combine and deduplicate vouchers
  const vouchers: Voucher[] = useMemo(() => {
    const map = new Map<string, Voucher>();

    // 1. Add vouchers from public endpoint
    if (scope === 'shop') {
      shopVouchers.forEach((v) => {
        if (v.isActive) map.set(v._id, v);
      });
    } else {
      platformVouchers.forEach((v) => {
        if (v.isActive) map.set(v._id, v);
      });
    }

    // 2. Add vouchers from user's saved wallet matching this scope/shop
    savedList.forEach((saved) => {
      const v = saved.voucher;
      if (!v || !v.isActive || saved.status !== 'valid') return;

      if (scope === 'shop') {
        const vShopId = typeof v.shopId === 'object' ? v.shopId?._id : v.shopId;
        if (v.scope === 'shop' && vShopId === shopId) {
          map.set(v._id, v);
        }
      } else if (scope === 'platform') {
        if (v.scope === 'platform') {
          map.set(v._id, v);
        }
      }
    });

    const now = new Date();
    return Array.from(map.values()).filter((v) => new Date(v.endDate) >= now);
  }, [scope, shopId, shopVouchers, platformVouchers, savedList]);

  const handleApplyManual = () => {
    const code = manualCode.trim().toUpperCase();
    if (!code) return;
    onSelect(code);
    onClose();
  };

  const handleSelectVoucher = (code: string) => {
    onSelect(code);
    onClose();
  };

  const formatDiscountVal = (voucher: Voucher) => {
    if (voucher.type === 'percentage') {
      return `${voucher.value}%`;
    }
    const val = voucher.value;
    if (val >= 1000000) return `${val / 1000000}Tr`;
    if (val >= 1000) return `${val / 1000}K`;
    return `₫${val.toLocaleString('vi-VN')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl bg-card border-border shadow-xl">
        <DialogHeader className="p-5 pb-4 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              {scope === 'shop' ? (
                <Store className="h-5 w-5" strokeWidth={1.8} />
              ) : (
                <Ticket className="h-5 w-5" strokeWidth={1.8} />
              )}
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                {scope === 'shop' ? `Voucher của ${shopName}` : 'Chọn Voucher Nền Tảng'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Áp dụng mã giảm giá để tiết kiệm cho đơn hàng của bạn
              </DialogDescription>
            </div>
          </div>

          {/* Manual Input */}
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Nhập mã voucher khác..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyManual()}
              className="h-9 uppercase tracking-wider text-xs font-mono font-bold"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleApplyManual}
              disabled={!manualCode.trim()}
              className="h-9 px-4 text-xs font-semibold shrink-0"
            >
              Áp dụng
            </Button>
          </div>
        </DialogHeader>

        {/* Voucher List */}
        <div className="max-h-[380px] overflow-y-auto p-4 sm:p-5 space-y-3">
          {isLoading ? (
            <div className="flex min-h-[160px] items-center justify-center">
              <SpinnerLoading />
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-2">
                <Ticket className="h-6 w-6 opacity-60" />
              </div>
              <p className="text-sm font-medium text-foreground">Không có voucher khả dụng</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bạn có thể nhập mã voucher trực tiếp ở ô tìm kiếm phía trên.
              </p>
            </div>
          ) : (
            vouchers.map((voucher) => {
              const meetsCondition = orderTotal >= (voucher.minOrderValue || 0);
              const isSelected = selectedCode === voucher.code;
              const missingAmount = (voucher.minOrderValue || 0) - orderTotal;

              return (
                <div
                  key={voucher._id}
                  className={cn(
                    'relative flex overflow-hidden rounded-xl border transition-all duration-200',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : meetsCondition
                        ? 'border-border/80 bg-card hover:border-primary/40'
                        : 'border-border/50 bg-muted/20 opacity-65',
                  )}
                >
                  {/* Left Value Stub */}
                  <div
                    className={cn(
                      'relative flex w-24 shrink-0 flex-col items-center justify-center p-3 text-center border-r border-dashed border-border select-none',
                      scope === 'shop' ? 'bg-info/10' : 'bg-primary/10',
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-bold uppercase tracking-wider',
                        scope === 'shop' ? 'text-info' : 'text-primary',
                      )}
                    >
                      GIẢM
                    </span>
                    <span
                      className={cn(
                        'text-xl font-black tracking-tight leading-tight',
                        scope === 'shop' ? 'text-info' : 'text-primary',
                      )}
                    >
                      {formatDiscountVal(voucher)}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-medium mt-0.5">
                      {scope === 'shop' ? 'Shop' : 'Toàn sàn'}
                    </span>

                    {/* Cutout punch holes */}
                    <div className="absolute -right-1.5 top-0 h-3 w-3 rounded-full bg-card border-l border-border" />
                    <div className="absolute -right-1.5 bottom-0 h-3 w-3 rounded-full bg-card border-l border-border" />
                  </div>

                  {/* Right Details */}
                  <div className="flex flex-1 flex-col justify-between p-3 min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-foreground">
                          {voucher.code}
                        </span>
                        {isSelected && (
                          <Badge
                            variant="default"
                            className="text-[10px] font-semibold h-5 px-1.5 bg-primary gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Đang dùng
                          </Badge>
                        )}
                      </div>

                      <p className="line-clamp-1 text-xs font-medium text-foreground mt-1">
                        {voucher.name}
                      </p>

                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Đơn tối thiểu: {formatCurrency(voucher.minOrderValue || 0)}
                      </p>

                      {!meetsCondition && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-500 font-medium">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>Mua thêm {formatCurrency(missingAmount)} để áp dụng</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground">
                        HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                      </span>

                      {meetsCondition && !isSelected && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSelectVoucher(voucher.code)}
                          className="h-7 text-xs font-semibold px-3"
                        >
                          Áp dụng
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-border/70 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>Đơn hiện tại: {formatCurrency(orderTotal)}</span>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
