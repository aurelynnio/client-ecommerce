'use client';

import { useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, ChevronLeft, ChevronRight, ArrowRight, Flame, Clock } from 'lucide-react';
import { useFlashSaleWithCountdown } from '@/hooks/queries/useFlashSale';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface FlashSaleSectionProps {
  embedded?: boolean;
}

export default function FlashSaleSection({ embedded = false }: FlashSaleSectionProps) {
  const { products, countdown, isLoading } = useFlashSaleWithCountdown();
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayProducts = products.slice(0, 12);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  // Gracefully format multi-day / hourly countdowns so numbers never overflow or look awkward
  const timeUnits = useMemo(() => {
    if (!countdown || countdown <= 0) {
      return { days: 0, hours: '00', minutes: '00', seconds: '00' };
    }
    const days = Math.floor(countdown / 86400);
    const hours = Math.floor((countdown % 86400) / 3600);
    const minutes = Math.floor((countdown % 3600) / 60);
    const seconds = countdown % 60;

    return {
      days,
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  }, [countdown]);

  if (!isLoading && displayProducts.length === 0) {
    return null;
  }

  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-card transition-all',
        embedded ? 'p-0' : 'p-4 sm:p-5'
      )}
    >
      {/* Header Bar */}
      <div className="mb-4 flex flex-col gap-3 border-b border-muted/50 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Brand Icon & Title */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Zap className="h-5 w-5 fill-current animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-foreground uppercase sm:text-xl">
                  Flash Sale
                </h2>
                <span className="hidden items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary sm:inline-flex">
                  Giá chớp nhoáng
                </span>
              </div>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-xs">
            <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="mr-1 hidden font-medium text-muted-foreground sm:inline">Kết thúc trong:</span>
            <div className="flex items-center gap-1 font-mono font-bold">
              {timeUnits.days > 0 && (
                <>
                  <span className="min-w-6 rounded bg-foreground px-1.5 py-0.5 text-center text-xs text-background tabular-nums">
                    {timeUnits.days}d
                  </span>
                  <span className="text-foreground">:</span>
                </>
              )}
              <span className="min-w-6 rounded bg-foreground px-1.5 py-0.5 text-center text-xs text-background tabular-nums">
                {timeUnits.hours}
              </span>
              <span className="text-foreground">:</span>
              <span className="min-w-6 rounded bg-foreground px-1.5 py-0.5 text-center text-xs text-background tabular-nums">
                {timeUnits.minutes}
              </span>
              <span className="text-foreground">:</span>
              <span className="min-w-6 rounded bg-foreground px-1.5 py-0.5 text-center text-xs text-background tabular-nums">
                {timeUnits.seconds}
              </span>
            </div>
          </div>
        </div>

        {/* Action & Nav arrows */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <Link
            href="/flash-sale"
            className="group flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover sm:text-sm"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>

          {/* Rail scroll buttons in header */}
          <div className="hidden items-center gap-1.5 border-l border-muted pl-2 sm:flex">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => scroll('left')}
              aria-label="Cuộn sang trái"
              className="h-8 w-8 rounded-full bg-card hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => scroll('right')}
              aria-label="Cuộn sang phải"
              className="h-8 w-8 rounded-full bg-card hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Rail */}
      <div className="group/rail relative">
        {/* Floating Side Arrows on larger screens */}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => scroll('left')}
          aria-label="Cuộn trái"
          className="absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-card shadow-md opacity-0 transition-all duration-200 group-hover/rail:opacity-100 hover:scale-110 active:scale-95 md:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => scroll('right')}
          aria-label="Cuộn phải"
          className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-card shadow-md opacity-0 transition-all duration-200 group-hover/rail:opacity-100 hover:scale-110 active:scale-95 md:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-3.5 overflow-x-auto scroll-smooth pb-1 pt-0.5"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[155px] shrink-0 animate-pulse rounded-xl bg-card p-2.5 sm:w-[175px] md:w-[190px]"
                >
                  <div className="aspect-square w-full rounded-lg bg-muted" />
                  <div className="mt-2.5 h-3.5 w-full rounded bg-muted" />
                  <div className="mt-1.5 h-3.5 w-3/4 rounded bg-muted" />
                  <div className="mt-2.5 h-4 w-1/2 rounded bg-muted" />
                  <div className="mt-2.5 h-3.5 w-full rounded-full bg-muted" />
                </div>
              ))
            : displayProducts.map((product, index) => {
                const image =
                  product.variants?.[0]?.images?.[0] || '/images/placeholder-product.svg';
                const salePrice = product.flashSaleInfo?.salePrice || 0;
                const originalPrice = product.flashSaleInfo?.originalPrice || 0;
                const discount = product.flashSaleInfo?.discount || 0;
                const soldPercent = Math.min(100, Math.max(0, product.flashSaleInfo?.soldPercent || 0));
                const soldCount = product.flashSaleInfo?.soldCount || 0;

                return (
                  <Link
                    key={`${product._id}-${index}`}
                    href={`/products/${product.slug || product._id}`}
                    className="group/item flex w-[155px] shrink-0 flex-col justify-between rounded-xl bg-card p-2 transition-all duration-200 hover:-translate-y-1 hover:bg-muted/30 sm:w-[175px] sm:p-2.5 md:w-[190px]"
                  >
                    <div>
                      {/* Image Area with Floating Deal Badges */}
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover/item:scale-105"
                          sizes="(max-width: 640px) 155px, (max-width: 768px) 175px, 190px"
                        />
                        {discount > 0 && (
                          <div className="absolute left-1.5 top-1.5 flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground shadow-xs sm:text-[11px]">
                            <span>-{discount}%</span>
                          </div>
                        )}
                        {(discount >= 30 || soldPercent >= 50) && (
                          <div
                            className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-card/90 text-primary shadow-xs backdrop-blur-xs"
                            title="Hot Deal"
                          >
                            <Flame className="h-3 w-3 fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3
                        className="mt-2 line-clamp-2 min-h-[2.25rem] text-xs font-medium leading-snug text-foreground transition-colors group-hover/item:text-primary sm:text-[13px]"
                        title={product.name}
                      >
                        {product.name}
                      </h3>
                    </div>

                    {/* Bottom Area: Pricing & Sold Progress */}
                    <div className="mt-2 pt-1">
                      <div className="flex flex-wrap items-baseline gap-1">
                        <span className="text-sm font-extrabold tracking-tight text-primary sm:text-base">
                          {formatCurrency(salePrice)}
                        </span>
                        {originalPrice > salePrice && (
                          <span className="text-[11px] text-price-strikethrough line-through">
                            {formatCurrency(originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Fire / Sold Progress Bar */}
                      <div className="relative mt-2 h-4 w-full overflow-hidden rounded-full bg-primary/10">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.max(12, soldPercent)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-primary-foreground sm:text-[10px]">
                          {soldPercent >= 80 ? (
                            <span className="flex items-center gap-0.5">
                              <Flame className="h-2.5 w-2.5 fill-current" />
                              <span>Sắp hết</span>
                            </span>
                          ) : soldCount > 0 ? (
                            <span>Đã bán {soldCount}</span>
                          ) : soldPercent > 0 ? (
                            <span>Đã bán {soldPercent}%</span>
                          ) : (
                            <span>Vừa mở bán</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="aura-container py-4 sm:py-5">
      {content}
    </section>
  );
}
