'use client';

import { Zap } from 'lucide-react';
import FlashSaleSection from '@/components/product/FlashSaleSection';
import ProductGrid from '@/components/product/ProductGrid';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useFlashSaleWithCountdown } from '@/hooks/queries/useFlashSale';

export default function FlashSalePage() {
  const { products = [], isLoading, error, formattedCountdown } = useFlashSaleWithCountdown();
  return (
    <main className="min-h-screen bg-background">
      <div className="aura-container py-7 sm:py-10">
        <header className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Ưu đãi có thời hạn</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Ưu đãi chớp nhoáng</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sản phẩm giảm giá trong khoảng thời gian hiện tại.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium">
              Kết thúc sau {formattedCountdown.hours}:{formattedCountdown.minutes}:
              {formattedCountdown.seconds}
            </span>
          </div>
        </header>
        <section className="py-7">
          <FlashSaleSection />
        </section>
        <section className="border-t border-border pt-7">
          <h2 className="text-xl font-semibold">Tất cả sản phẩm ưu đãi</h2>
          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center">
              <SpinnerLoading />
            </div>
          ) : error ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Không thể tải ưu đãi lúc này. Vui lòng thử lại.
            </p>
          ) : (
            <div className="pt-5">
              <ProductGrid products={products} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
