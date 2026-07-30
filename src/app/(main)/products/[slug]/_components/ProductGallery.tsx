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
        <div className="hidden lg:flex w-[420px] h-[420px] bg-muted items-center justify-center rounded-sm shrink-0">
          <div className="flex flex-col items-center justify-center text-muted-foreground/60">
            <Store className="w-16 h-16 opacity-20 mb-2" />
            <span className="text-sm">Không có ảnh</span>
          </div>
        </div>
        {/* Mobile - Aspect ratio */}
        <div className="lg:hidden -mx-4 w-full aspect-square bg-muted flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center text-muted-foreground/60">
            <Store className="w-12 h-12 opacity-20 mb-2" />
            <span className="text-sm">Không có ảnh</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Gallery */}
      <div className="hidden lg:flex gap-4 shrink-0">
        {/* Vertical Thumbnails */}
        <div className="flex flex-col gap-2 w-[60px]">
          {images.map((img, idx) => (
            <button
              key={idx}
              onMouseEnter={() => onIndexChange(idx)}
              onClick={() => onIndexChange(idx)}
              className={cn(
                'relative h-[60px] w-[60px] overflow-hidden rounded-sm border-2 transition-[border-color,box-shadow]',
                selectedIndex === idx ? 'border-primary' : 'border-transparent hover:border-border',
              )}
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
        <div className="w-[420px] h-[420px] relative border border-border/50 rounded-sm overflow-hidden bg-card group shrink-0">
          {images[selectedIndex] && !imageError ? (
            <Image
              src={images[selectedIndex]}
              alt={productName}
              fill
              className="object-contain p-2 transition-transform group-hover:scale-105"
              priority
              sizes="420px"
              onError={() => setFailedImageIndex(selectedIndex)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground/60">
              <Store className="w-16 h-16 opacity-20 mb-2" />
              <span className="text-sm">Không có ảnh</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Gallery - Swipeable */}
      <div
        className="lg:hidden -mx-4 relative"
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
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground/60">
              <Store className="w-12 h-12 opacity-20 mb-2" />
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
                  'absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white transition-opacity',
                  selectedIndex === 0 ? 'opacity-30' : 'opacity-70 hover:opacity-100',
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={selectedIndex === images.length - 1}
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white transition-opacity',
                  selectedIndex === images.length - 1
                    ? 'opacity-30'
                    : 'opacity-70 hover:opacity-100',
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/30 text-white text-[10px] px-2 py-0.5 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Dot Indicators */}
        {images.length > 1 && images.length <= 10 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={cn(
                  'h-2 w-2 rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none',
                  selectedIndex === idx ? 'w-4 bg-primary' : 'bg-muted-foreground/40',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ProductGallery;
