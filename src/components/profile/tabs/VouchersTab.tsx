'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Ticket, Store, Copy, Check, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useSavedVouchers, useUnsaveVoucher } from '@/hooks/queries';
import { SavedVoucher } from '@/types/voucher';
import { cn } from '@/lib/utils';
import { Shop } from '@/types/shop';

type VoucherFilter = 'all' | 'valid' | 'used' | 'expired';

export default function VouchersTab() {
  const [activeFilter, setActiveFilter] = useState<VoucherFilter>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: savedList = [], isLoading, error } = useSavedVouchers();
  const unsaveMutation = useUnsaveVoucher();

  const counts = useMemo(() => {
    return {
      all: savedList.length,
      valid: savedList.filter((item) => item.status === 'valid').length,
      used: savedList.filter((item) => item.status === 'used').length,
      expired: savedList.filter((item) => item.status === 'expired').length,
    };
  }, [savedList]);

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return savedList;
    return savedList.filter((item) => item.status === activeFilter);
  }, [savedList, activeFilter]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã: ${code}`);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2000);
  };

  const handleUnsave = async (voucherId: string) => {
    try {
      await unsaveMutation.mutateAsync(voucherId);
      toast.success('Đã bỏ lưu voucher khỏi ví');
    } catch {
      toast.error('Không thể bỏ lưu voucher');
    }
  };

  const formatDiscount = (voucher: SavedVoucher['voucher']) => {
    if (voucher.type === 'percentage') {
      return `${voucher.value}%`;
    }
    const val = voucher.value;
    if (val >= 1000000) {
      return `${val / 1000000}Tr`;
    }
    if (val >= 1000) {
      return `${val / 1000}K`;
    }
    return `₫${val.toLocaleString('vi-VN')}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <SpinnerLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive">
        Không thể tải danh sách voucher đã lưu. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Ticket className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">Ví Voucher của bạn</h2>
              <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                {counts.valid} khả dụng
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quản lý các mã giảm giá bạn đã thu thập để sử dụng khi mua sắm
            </p>
          </div>
        </div>

        <Button asChild size="sm" className="gap-1.5 self-start sm:self-auto">
          <Link href="/vouchers">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Săn thêm voucher</span>
          </Link>
        </Button>
      </div>

      {/* Tabs Filter */}
      <Tabs
        value={activeFilter}
        onValueChange={(val) => setActiveFilter(val as VoucherFilter)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            Tất cả ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="valid" className="text-xs sm:text-sm">
            Khả dụng ({counts.valid})
          </TabsTrigger>
          <TabsTrigger value="used" className="text-xs sm:text-sm">
            Đã dùng ({counts.used})
          </TabsTrigger>
          <TabsTrigger value="expired" className="text-xs sm:text-sm">
            Hết hạn ({counts.expired})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Vouchers Grid */}
      {filteredList.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
            <Ticket className="h-7 w-7 opacity-70" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Không có voucher nào</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {activeFilter === 'all'
              ? 'Bạn chưa lưu mã giảm giá nào trong ví. Hãy khám phá và lưu voucher để được giảm giá khi mua sắm!'
              : `Không có voucher nào thuộc trạng thái "${
                  activeFilter === 'valid'
                    ? 'Khả dụng'
                    : activeFilter === 'used'
                      ? 'Đã dùng'
                      : 'Hết hạn'
                }".`}
          </p>
          {activeFilter === 'all' && (
            <Button asChild size="sm" className="mt-4 gap-1.5">
              <Link href="/vouchers">
                <span>Khám phá kho voucher</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredList.map((item) => {
            const { voucher, status, remainingUsage } = item;
            const isPlatform = voucher.scope === 'platform';
            const isUsable = status === 'valid';
            const shopObj = typeof voucher.shopId === 'object' ? (voucher.shopId as Shop) : null;
            const useUrl = isPlatform
              ? '/cart'
              : shopObj?.slug
                ? `/shop/${shopObj.slug}`
                : '/';

            return (
              <div
                key={item._id}
                className={cn(
                  'group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-200 bg-card',
                  isUsable
                    ? 'border-border/80 shadow-xs hover:border-primary/40 hover:shadow-sm'
                    : 'border-border/50 opacity-70 bg-muted/20',
                )}
              >
                {/* Header / Value Section */}
                <div
                  className={cn(
                    'relative p-4 border-b border-border/60',
                    isUsable ? 'bg-primary/5' : 'bg-muted/40',
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {isPlatform ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                          <Ticket className="h-3.5 w-3.5" />
                          Toàn sàn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-info">
                          <Store className="h-3.5 w-3.5" />
                          {shopObj?.name || 'Cửa hàng'}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    {status === 'valid' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold text-success border-success/30 bg-success/10"
                      >
                        Khả dụng ({remainingUsage} lượt)
                      </Badge>
                    )}
                    {status === 'used' && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium text-muted-foreground bg-muted"
                      >
                        Đã sử dụng
                      </Badge>
                    )}
                    {status === 'expired' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium text-destructive border-destructive/30 bg-destructive/10"
                      >
                        Hết hạn
                      </Badge>
                    )}
                  </div>

                  {/* Value */}
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        'text-2xl font-black tracking-tight',
                        isUsable ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {formatDiscount(voucher)}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      {voucher.type === 'percentage' ? 'GIẢM' : 'GIẢM TRỰC TIẾP'}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {voucher.name}
                  </p>
                </div>

                {/* Perforated divider with cutouts */}
                <div className="relative">
                  <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-background border-r border-border/80" />
                  <div className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-background border-l border-border/80" />
                  <div className="border-t border-dashed border-border/80" />
                </div>

                {/* Details & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Mã:</span>
                      <span className="font-mono font-bold text-foreground">
                        {voucher.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Đơn tối thiểu:</span>
                      <span className="font-medium text-foreground">
                        ₫{voucher.minOrderValue.toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Hạn sử dụng:</span>
                      <span className="font-medium text-foreground">
                        {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(voucher.code)}
                      className="h-8 flex-1 text-xs gap-1 font-medium"
                    >
                      {copiedCode === voucher.code ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-success" />
                          <span>Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </Button>

                    {isUsable ? (
                      <Button asChild size="sm" className="h-8 flex-1 text-xs gap-1 font-semibold">
                        <Link href={useUrl}>
                          <span>Dùng ngay</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnsave(voucher._id)}
                        disabled={unsaveMutation.isPending}
                        className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1 px-2"
                        title="Xóa khỏi ví"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Bỏ lưu</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
