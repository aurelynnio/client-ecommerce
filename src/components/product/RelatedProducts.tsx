'use client';

import { useRelatedProducts } from '@/hooks/queries/useProducts';
import { ProductCard } from './ProductCard';
import SpinnerLoading from '../common/SpinnerLoading';

interface RelatedProductsProps {
  productId: string;
}

export default function RelatedProducts({ productId }: RelatedProductsProps) {
  const { data: related = [], isLoading } = useRelatedProducts(productId);

  if (!isLoading && related.length === 0) {
    return null; // Don't show section if empty
  }

  return (
    <div className="space-y-8 mt-16 pt-8 border-t border-border/50">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Sản phẩm tương tự
        </h2>
      </div>

      <div className="relative min-h-[200px]">
        {isLoading && <SpinnerLoading className="absolute inset-0 m-auto" />}

        <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {related.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
