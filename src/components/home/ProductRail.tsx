'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/product/ProductCard';
import { cn } from '@/utils/cn';

interface ProductRailProps {
  title: string;
  subtitle?: string;
  href?: string;
  products: Product[];
  isLoading?: boolean;
  accent?: 'primary' | 'warning';
}

export function ProductRail({
  title,
  subtitle,
  href,
  products,
  isLoading = false,
  accent = 'primary',
}: ProductRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const accentText = accent === 'warning' ? 'text-warning' : 'text-primary';

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span className={cn('inline-block h-5 w-1 rounded-full bg-current', accentText)} />
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
          >
            Xem tất cả
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="group/rail relative">
        {/* Scroll buttons */}
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Cuộn trái"
          className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:text-primary md:flex opacity-0 group-hover/rail:opacity-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Cuộn phải"
          className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:text-primary md:flex opacity-0 group-hover/rail:opacity-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Rail */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-2"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[160px] shrink-0 animate-pulse rounded-lg border border-border bg-card p-2 sm:w-[180px]"
                >
                  <div className="aspect-square w-full rounded bg-muted" />
                  <div className="mt-2 h-3 w-full rounded bg-muted" />
                  <div className="mt-1 h-3 w-2/3 rounded bg-muted" />
                </div>
              ))
            : products.map((product, index) => (
                <div key={`${product._id}-${index}`} className="w-[160px] shrink-0 sm:w-[180px]">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

export default ProductRail;
