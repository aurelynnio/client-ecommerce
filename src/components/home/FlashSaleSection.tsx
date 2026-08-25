'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useFlashSaleWithCountdown } from '@/hooks/queries/useFlashSale';
import { formatCurrency } from '@/utils/format';

export default function FlashSaleSection() {
  const { products, formattedCountdown, isLoading } = useFlashSaleWithCountdown();
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayProducts = products.slice(0, 8);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="aura-container py-5">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Header bar — Tmall red gradient feel (flat red) */}
        <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 fill-current" aria-hidden="true" />
            <h2 className="text-base font-bold sm:text-lg">Flash Sale</h2>
            <span className="text-xs opacity-90">Kết thúc trong</span>
            <div className="flex items-center gap-1">
              <span className="rounded bg-tmall-black px-1.5 py-0.5 text-xs font-bold tabular-nums">
                {formattedCountdown.hours}
              </span>
              <span className="text-xs font-bold">:</span>
              <span className="rounded bg-tmall-black px-1.5 py-0.5 text-xs font-bold tabular-nums">
                {formattedCountdown.minutes}
              </span>
              <span className="text-xs font-bold">:</span>
              <span className="rounded bg-tmall-black px-1.5 py-0.5 text-xs font-bold tabular-nums">
                {formattedCountdown.seconds}
              </span>
            </div>
          </div>
          <Link
            href="/flash-sale"
            className="flex items-center gap-1 text-xs font-medium opacity-90 hover:opacity-100"
          >
            Xem tất cả
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        {/* Product rail */}
        <div className="group/rail relative p-3">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Cuộn trái"
            className="absolute left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:text-primary md:flex opacity-0 group-hover/rail:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Cuộn phải"
            className="absolute right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:text-primary md:flex opacity-0 group-hover/rail:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div
            ref={scrollRef}
            className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth"
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[140px] shrink-0 animate-pulse rounded-lg border border-border bg-card p-2"
                  >
                    <div className="aspect-square w-full rounded bg-muted" />
                    <div className="mt-2 h-3 w-full rounded bg-muted" />
                    <div className="mt-1 h-3 w-2/3 rounded bg-muted" />
                  </div>
                ))
              : displayProducts.length > 0
                ? displayProducts.map((product, index) => {
                    const image =
                      product.variants?.[0]?.images?.[0] || '/images/placeholder-product.svg';
                    const salePrice = product.flashSaleInfo?.salePrice || 0;
                    const originalPrice = product.flashSaleInfo?.originalPrice || 0;
                    const discount = product.flashSaleInfo?.discount || 0;

                    return (
                      <Link
                        key={`${product._id}-${index}`}
                        href={`/products/${product.slug || product._id}`}
                        className="group/product flex w-[140px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40"
                      >
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-200 group-hover/product:scale-[1.03]"
                            sizes="140px"
                          />
                          {discount > 0 && (
                            <span className="absolute left-0 top-0 bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                              -{discount}%
                            </span>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-sm font-bold text-primary">
                            {formatCurrency(salePrice)}
                          </p>
                          {originalPrice > salePrice && (
                            <p className="text-[11px] text-price-strikethrough line-through">
                              {formatCurrency(originalPrice)}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })
                : (
                  <div className="w-full py-8 text-center">
                    <Zap className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Hiện chưa có chương trình Flash Sale nào.
                    </p>
                    <Link
                      href="/products"
                      className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      Khám phá sản phẩm khác →
                    </Link>
                  </div>
                )}
          </div>
        </div>
      </div>
    </section>
  );
}
