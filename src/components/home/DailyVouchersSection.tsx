'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Ticket, ChevronLeft, ChevronRight, ArrowRight, Copy, Check } from 'lucide-react';
import { usePlatformVouchers } from '@/hooks/queries';
import { toast } from 'sonner';
import { Voucher } from '@/types/voucher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

function formatVoucherValue(voucher: Voucher) {
  if (voucher.type === 'percentage') {
    return { value: `${voucher.value}%`, unit: 'GIẢM' };
  }
  if (voucher.value >= 1000000) {
    const mil = voucher.value / 1000000;
    return { value: `${mil % 1 === 0 ? mil : mil.toFixed(1)}Tr`, unit: 'GIẢM' };
  }
  if (voucher.value >= 1000) {
    const k = voucher.value / 1000;
    return { value: `${k % 1 === 0 ? k : k.toFixed(0)}K`, unit: 'GIẢM' };
  }
  return { value: `${voucher.value.toLocaleString('vi-VN')}₫`, unit: 'GIẢM' };
}

function VoucherTicket({ voucher }: { voucher: Voucher }) {
  const [copied, setCopied] = useState(false);
  const { value, unit } = formatVoucherValue(voucher);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success(`Đã sao chép mã ưu đãi: ${voucher.code}`);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const minOrderText =
    voucher.minOrderValue > 0
      ? `Đơn từ ${voucher.minOrderValue.toLocaleString('vi-VN')}₫`
      : 'Đơn từ 0₫';

  return (
    <div className="group/ticket relative flex w-[270px] shrink-0 overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card">
      {/* Left ticket stub */}
      <div className="relative flex w-[88px] shrink-0 flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-primary-bg/30 to-primary/10 p-2 text-center border-r border-dashed border-primary/25 select-none">
        <span className="mb-0.5 text-[8px] font-extrabold tracking-widest text-primary/80 uppercase">
          {voucher.scope === 'platform' ? 'Toàn sàn' : 'Shop'}
        </span>
        <span className="text-xl font-black tracking-tight text-primary leading-none">
          {value}
        </span>
        <span className="mt-1 text-[9px] font-bold tracking-widest text-primary/80 uppercase">
          {unit}
        </span>
      </div>

      {/* Punch-out semicircles on the dashed divider line */}
      <div className="pointer-events-none absolute left-[88px] top-0 h-full w-0 -translate-x-1/2">
        <div className="absolute -top-1.5 left-0 h-3 w-3 rounded-full bg-background border-b border-border/70" />
        <div className="absolute -bottom-1.5 left-0 h-3 w-3 rounded-full bg-background border-t border-border/70" />
      </div>

      {/* Right voucher details & actions */}
      <div className="flex flex-1 flex-col justify-between p-2.5 min-w-0">
        <div>
          <h3 className="line-clamp-1 text-xs font-bold text-foreground group-hover/ticket:text-primary transition-colors">
            {voucher.name}
          </h3>
          <p className="mt-0.5 text-[10px] text-muted-foreground font-medium">
            {minOrderText}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-1.5">
          <span className="inline-flex items-center rounded border border-dashed border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground/80">
            {voucher.code}
          </span>

          <Button
            type="button"
            size="sm"
            onClick={handleCopy}
            aria-label={`Sao chép mã ${voucher.code}`}
            className={cn(
              'h-6 rounded-full px-2.5 text-[10px] font-semibold transition-all shadow-none',
              copied
                ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                : 'bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95'
            )}
          >
            {copied ? (
              <span className="inline-flex items-center gap-1">
                <Check className="h-3 w-3" />
                <span>Đã chép</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Copy className="h-2.5 w-2.5" />
                <span>Sao chép</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DailyVouchersSection() {
  const { data: vouchers, isLoading } = usePlatformVouchers();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const activeVouchers =
    vouchers?.filter((v) => v.isActive && new Date(v.endDate) > new Date()) || [];

  if (!isLoading && activeVouchers.length === 0) return null;

  return (
    <section className="py-4 sm:py-5 bg-background">
      <div className="aura-container">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/15">
              <Ticket className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-foreground">Voucher hôm nay</h2>
                <Badge variant="default" className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary tracking-wide">
                  HOT
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Thu thập mã giảm giá để mua sắm tiết kiệm hơn mỗi ngày
              </p>
            </div>
          </div>
          <Link
            href="/vouchers"
            className="group flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="group/rail relative">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => scroll('left')}
            aria-label="Cuộn trái"
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md md:flex opacity-0 group-hover/rail:opacity-100 hover:-translate-y-1/2 hover:scale-105 active:scale-95 transition-all bg-card"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => scroll('right')}
            aria-label="Cuộn phải"
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 rounded-full shadow-md md:flex opacity-0 group-hover/rail:opacity-100 hover:-translate-y-1/2 hover:scale-105 active:scale-95 transition-all bg-card"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div
            ref={scrollRef}
            className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-1"
          >
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[88px] w-[270px] shrink-0 animate-pulse rounded-xl bg-muted"
                  />
                ))
              : activeVouchers.map((voucher) => (
                  <VoucherTicket key={voucher._id} voucher={voucher} />
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}

