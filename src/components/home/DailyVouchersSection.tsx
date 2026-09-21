'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Ticket, ChevronLeft, ChevronRight, ArrowRight, Copy } from 'lucide-react';
import { usePlatformVouchers } from '@/hooks/queries';
import { toast } from 'sonner';
import { Voucher } from '@/types/voucher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function formatVoucherValue(voucher: Voucher) {
  if (voucher.type === 'percentage') return `${voucher.value}%`;
  return `${voucher.value.toLocaleString('vi-VN')}₫`;
}

function VoucherTicket({ voucher }: { voucher: Voucher }) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(voucher.code);
    toast.success(`Đã sao chép mã: ${voucher.code}`);
  };

  return (
    <div className="relative flex w-[200px] shrink-0 overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40">
      {/* Left — value section */}
      <div className="flex w-[70px] shrink-0 flex-col items-center justify-center bg-primary p-2 text-center">
        <span className="text-base font-bold text-primary-foreground">
          {formatVoucherValue(voucher)}
        </span>
        <span className="text-[10px] text-primary-foreground/80">Giảm</span>
      </div>

      {/* Punch-out circles */}
      <div className="absolute left-[70px] top-0 h-full w-0">
        <div className="absolute -top-1 left-0 h-2 w-2 -translate-x-1/2 rounded-full bg-background" />
        <div className="absolute -bottom-1 left-0 h-2 w-2 -translate-x-1/2 rounded-full bg-background" />
      </div>

      {/* Right — info */}
      <div className="flex flex-1 flex-col justify-between p-2.5">
        <div>
          <p className="line-clamp-1 text-xs font-medium text-foreground">{voucher.name}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Đơn tối thiểu {voucher.minOrderValue.toLocaleString('vi-VN')}₫
          </p>
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-medium text-primary">
            {voucher.code}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            aria-label={`Sao chép mã ${voucher.code}`}
            className="h-6 w-6 rounded p-1 text-muted-foreground hover:text-primary"
          >
            <Copy className="h-3 w-3" />
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
    <section className="bg-muted/30">
      <div className="aura-container py-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-foreground">Voucher hôm nay</h2>
            <Badge variant="default" className="text-[10px] font-bold px-2 py-0.5">
              HOT
            </Badge>
          </div>
          <Link
            href="/vouchers"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
          >
            Xem tất cả
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        <div className="group/rail relative">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => scroll('left')}
            aria-label="Cuộn trái"
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md md:flex opacity-0 group-hover/rail:opacity-100 hover:-translate-y-1/2 hover:scale-105 active:scale-95 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => scroll('right')}
            aria-label="Cuộn phải"
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 rounded-full shadow-md md:flex opacity-0 group-hover/rail:opacity-100 hover:-translate-y-1/2 hover:scale-105 active:scale-95 transition-all"
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
                    className="h-20 w-[200px] shrink-0 animate-pulse rounded-lg bg-muted"
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
