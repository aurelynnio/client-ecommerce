'use client';

import Link from 'next/link';
import { ChevronRight, Home, Zap } from 'lucide-react';
import FlashSaleSection from '@/components/product/FlashSaleSection';
import ProductGrid from '@/components/product/ProductGrid';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useFlashSaleWithCountdown } from '@/hooks/queries/useFlashSale';

export default function FlashSalePage() {
  const { products = [], isLoading, error, formattedCountdown } = useFlashSaleWithCountdown();
  return (
    <main className="min-h-screen bg-background py-4">
      <div className="aura-container">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href="/" className="flex items-center gap-1 transition-colors hover:text-primary">
            <Home className="h-3 w-3" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">Flash Sale</span>
        </nav>

        <header className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Ưu đãi có thời hạn</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight lg:text-3xl">
              Ưu đãi chớp nhoáng
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Sản phẩm giảm giá trong khoảng thời gian hiện tại
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">
              Kết thúc sau {formattedCountdown.hours}:{formattedCountdown.minutes}:
              {formattedCountdown.seconds}
            </span>
          </div>
        </header>
        <section className="py-4">
          <FlashSaleSection />
        </section>
        <section className="border-t border-border pt-4">
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
