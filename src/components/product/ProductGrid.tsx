// Shared stable product grid for catalog, search and account product results.
'use client';

import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductSkeleton';
import { StaggerContainer, StaggerItem } from '@/components/motion/primitives';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
}

/**
 * Responsive product grid
 *
 * Breakpoints:
 * - Mobile (< 640px): 2 columns
 * - Tablet (640px - 1023px): 3 columns
 * - Desktop (1024px+): 4 columns
 */
export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 12,
  className = '',
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 ${className}`}
        data-testid="product-grid"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => {
          const isFeatured = (i + 1) % 8 === 0;
          return (
            <div key={i} className={`${isFeatured ? 'md:col-span-2' : ''}`}>
              <ProductCardSkeleton />
            </div>
          );
        })}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">Không tìm thấy sản phẩm</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
        </p>
      </div>
    );
  }

  return (
    <StaggerContainer
      className={`grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 ${className}`}
    >
      {products.map((product, idx) => {
        const isFeatured = (idx + 1) % 8 === 0;
        return (
          <StaggerItem key={product._id} className={`${isFeatured ? 'md:col-span-2' : ''}`}>
            <ProductCard product={product} index={idx} />
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}

export default ProductGrid;
