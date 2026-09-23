'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { ParsedProduct } from './productParser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCarouselProps {
  products: ParsedProduct[];
  onQuickBuy: (product: ParsedProduct) => void;
}

export default function ProductCarousel({ products, onQuickBuy }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  // If only 1 product, render a clean card instead of carousel
  if (products.length === 1) {
    const item = products[0];
    return (
      <div className="my-2 rounded-xl border border-border/80 bg-card p-3 shadow-2xs hover:border-primary/40 transition-all">
        <div className="flex gap-3">
          <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted border border-border/60">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                <ShoppingBag className="h-6 w-6" />
              </div>
            )}
            {item.discountPercent !== undefined && item.discountPercent > 0 && (
              <Badge className="absolute top-1 left-1 bg-destructive text-white border-0 text-[9px] font-bold px-1 py-0 h-4">
                -{item.discountPercent}%
              </Badge>
            )}
          </div>

          <div className="min-w-0 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                {item.brand && (
                  <Badge variant="outline" className="h-4.5 px-1.5 text-[10px] font-semibold text-primary border-primary/30">
                    <Tag className="mr-0.5 h-2.5 w-2.5" />
                    {item.brand}
                  </Badge>
                )}
                {item.size && (
                  <Badge variant="secondary" className="h-4.5 px-1.5 text-[10px]">
                    Size: {item.size}
                  </Badge>
                )}
              </div>
              <Link
                href={item.productUrl}
                className="text-xs font-bold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug"
                title={item.name}
              >
                {item.name}
              </Link>
            </div>

            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-sm font-bold text-primary">{item.price}</span>
              {item.originalPrice && (
                <span className="text-[11px] text-muted-foreground line-through">
                  {item.originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3 pt-2 border-t border-border/60">
          <Link
            href={item.productUrl}
            className="flex-1 inline-flex h-7.5 items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Chi tiết</span>
          </Link>
          <Button
            size="sm"
            onClick={() => onQuickBuy(item)}
            className="flex-1 h-7.5 text-xs font-semibold gap-1 rounded-lg shadow-2xs"
          >
            <ShoppingBag className="h-3 w-3" />
            <span>Mua nhanh</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group/carousel w-full my-2">
      {/* Scroll controls */}
      {products.length > 2 && (
        <>
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/95 border border-border shadow-md flex items-center justify-center text-foreground hover:text-primary transition-all active:scale-95"
            aria-label="Previous product"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/95 border border-border shadow-md flex items-center justify-center text-foreground hover:text-primary transition-all active:scale-95"
            aria-label="Next product"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x snap-mandatory px-0.5"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((item) => (
          <div
            key={item.id}
            className="snap-start shrink-0 w-[205px] flex flex-col justify-between rounded-xl border border-border/80 bg-card p-2.5 shadow-2xs hover:border-primary/50 hover:shadow-xs transition-all"
          >
            <div>
              {/* Product Thumbnail */}
              <div className="relative h-28 w-full rounded-lg overflow-hidden bg-muted/50 border border-border/40 mb-2">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="205px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground/40 bg-muted">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                )}
                {item.discountPercent !== undefined && item.discountPercent > 0 && (
                  <Badge className="absolute top-1.5 left-1.5 bg-destructive text-white border-0 text-[10px] font-bold px-1.5 py-0 h-4 shadow-2xs">
                    -{item.discountPercent}%
                  </Badge>
                )}
              </div>

              {/* Brand & Category */}
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                {item.brand && (
                  <span className="font-semibold text-primary truncate max-w-[90px]">
                    {item.brand}
                  </span>
                )}
                {item.brand && item.category && <span>•</span>}
                {item.category && <span className="truncate">{item.category}</span>}
              </div>

              {/* Title */}
              <Link
                href={item.productUrl}
                className="text-xs font-bold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug"
                title={item.name}
              >
                {item.name}
              </Link>
            </div>

            {/* Price & Action */}
            <div className="mt-2.5 pt-2 border-t border-border/60">
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-xs font-bold text-primary">{item.price}</span>
                {item.originalPrice && (
                  <span className="text-[10px] text-muted-foreground line-through">
                    {item.originalPrice}
                  </span>
                )}
              </div>

              <div className="flex gap-1.5">
                <Link
                  href={item.productUrl}
                  className="inline-flex h-7 items-center justify-center px-2 rounded-lg border border-border bg-background text-[11px] font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
                  title="Xem chi tiết"
                >
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onQuickBuy(item)}
                  className="flex-1 h-7 text-[11px] font-semibold gap-1 rounded-lg shadow-2xs"
                >
                  <ShoppingBag className="h-3 w-3" />
                  <span>Mua nhanh</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

