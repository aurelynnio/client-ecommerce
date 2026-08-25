'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Ticket, ChevronLeft, ChevronRight, ArrowRight, Copy } from 'lucide-react';
import { usePlatformVouchers } from '@/hooks/queries';
import { toast } from 'sonner';
import { Voucher } from '@/types/voucher';

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
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Sao chép mã ${voucher.code}`}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DailyVouchersSection() {
  const { data: vouchers = [], isLoading } = usePlatformVouchers();
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayVouchers = vouchers.slice(0, 6);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-card">
      <div className="aura-container py-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-foreground">Voucher hôm nay</h2>
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              HOT
            </span>
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
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Cuộn trái"
            className="absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:text-primary md:flex opacity-0 group-hover/rail:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Cuộn phải"
            className="absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:text-primary md:flex opacity-0 group-hover/rail:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div
            ref={scrollRef}
            className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-1"
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 w-[200px] shrink-0 animate-pulse rounded-lg border border-border bg-muted"
                  />
                ))
              : displayVouchers.length > 0
                ? displayVouchers.map((voucher) => (
                    <VoucherTicket key={voucher._id} voucher={voucher} />
                  ))
                : (
                  <div className="w-full py-6 text-center">
                    <Ticket className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Hiện chưa có voucher nào.
                    </p>
                  </div>
                )}
          </div>
        </div>
      </div>
    </section>
  );
}
