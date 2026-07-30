'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight, Store } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

export function ProductGallery({
  images,
  productName,
  selectedIndex,
  onIndexChange,
}: ProductGalleryProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [failedImageIndex, setFailedImageIndex] = useState<number | null>(null);
  const imageError = failedImageIndex === selectedIndex;

  // Handle swipe on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedIndex < images.length - 1) {
        onIndexChange(selectedIndex + 1);
      } else if (diff < 0 && selectedIndex > 0) {
        onIndexChange(selectedIndex - 1);
      }
    }
    setTouchStart(null);
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      onIndexChange(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex < images.length - 1) {
      onIndexChange(selectedIndex + 1);
    }
  };

  if (!images.length) {
    return (
      <>
        {/* Desktop - Fixed size */}
        <div className="hidden w-full max-w-[480px] items-center justify-center rounded-lg border border-border bg-muted lg:flex">
          <div className="flex aspect-square w-full flex-col items-center justify-center text-muted-foreground/60">
            <Store className="mb-2 h-16 w-16 opacity-20" />
            <span className="text-sm">Không có ảnh</span>
          </div>
        </div>
        {/* Mobile - Aspect ratio */}
        <div className="flex aspect-square w-full flex-col items-center justify-center bg-muted lg:hidden">
          <div className="flex flex-col items-center justify-center text-muted-foreground/60">
            <Store className="mb-2 h-12 w-12 opacity-20" />
            <span className="text-sm">Không có ảnh</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Gallery */}
      <div className="hidden w-full max-w-[480px] gap-3 lg:flex">
        {/* Vertical Thumbnails */}
        <div className="flex w-[60px] shrink-0 flex-col gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onMouseEnter={() => onIndexChange(idx)}
              onClick={() => onIndexChange(idx)}
              className={cn(
                'relative h-[60px] w-[60px] overflow-hidden rounded-md border transition-colors',
                selectedIndex === idx ? 'border-primary' : 'border-border hover:border-muted-foreground',
              )}
              aria-label={`Xem ảnh ${idx + 1}`}
              aria-current={selectedIndex === idx}
            >
              <Image
                src={img}
                alt={`${productName} - ${idx + 1}`}
                fill
                className="object-cover"
                sizes="60px"
              />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div className="group relative aspect-square shrink-0 flex-1 overflow-hidden rounded-lg border border-border bg-card">
          {images[selectedIndex] && !imageError ? (
            <Image
              src={images[selectedIndex]}
              alt={productName}
              fill
              className="object-contain p-2 transition-transform group-hover:scale-105 motion-reduce:transform-none"
              priority
              sizes="(max-width: 1024px) 0px, 420px"
              onError={() => setFailedImageIndex(selectedIndex)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-muted/50 text-muted-foreground/60">
              <Store className="mb-2 h-16 w-16 opacity-20" />
              <span className="text-sm">Không có ảnh</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Gallery - Swipeable */}
      <div
        className="relative lg:hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-card">
          {images[selectedIndex] && !imageError ? (
            <Image
              src={images[selectedIndex]}
              alt={productName}
              fill
              className="object-contain"
              priority
              sizes="100vw"
              onError={() => setFailedImageIndex(selectedIndex)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-muted/50 text-muted-foreground/60">
              <Store className="mb-2 h-12 w-12 opacity-20" />
              <span className="text-sm">Không có ảnh</span>
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                disabled={selectedIndex === 0}
                className={cn(
                  'absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition-opacity',
                  selectedIndex === 0 ? 'opacity-30' : 'opacity-70 hover:opacity-100',
                )}
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={selectedIndex === images.length - 1}
                className={cn(
                  'absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition-opacity',
                  selectedIndex === images.length - 1
                    ? 'opacity-30'
                    : 'opacity-70 hover:opacity-100',
                )}
                aria-label="Ảnh sau"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Dot Indicators */}
        {images.length > 1 && images.length <= 10 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={cn(
                  'h-2 rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none',
                  selectedIndex === idx ? 'w-4 bg-primary' : 'w-2 bg-muted-foreground/40',
                )}
                aria-label={`Chuyển đến ảnh ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ProductGallery;
