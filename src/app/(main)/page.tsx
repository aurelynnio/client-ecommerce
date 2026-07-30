'use client';

import { useState, useMemo } from 'react';
import BannerCarousel from '@/components/home/BannerCarousel';
import CategoryGrid from '@/components/home/CategoryGrid';
import TrustBar from '@/components/home/TrustBar';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import DailyVouchersSection from '@/components/home/DailyVouchersSection';
import TopShopsSection from '@/components/home/TopShopsSection';
import ProductRail from '@/components/home/ProductRail';
import HomeProductList from '@/components/home/HomeProductList';
import PromoGrid from '@/components/home/PromoGrid';
import { useNewArrivals } from '@/hooks/queries';
import { Shop } from '@/types/shop';

export default function Home() {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const { data: newArrivals = [], isLoading: newArrivalsLoading } = useNewArrivals();

  // Extract unique shops from new arrivals products
  const topShops = useMemo(() => {
    const shopsMap = new Map<string, Shop>();
    newArrivals.forEach((product) => {
      const shop = product.shop;
      if (shop && typeof shop === 'object' && '_id' in shop && !shopsMap.has(shop._id)) {
        shopsMap.set(shop._id, shop);
      }
    });
    return Array.from(shopsMap.values());
  }, [newArrivals]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero — Tmall-style banner carousel + mini promo grid */}
      <BannerCarousel />

      {/* Category — rich icon grid */}
      <CategoryGrid
        selectedSlug={selectedCategorySlug}
        onSelectCategory={setSelectedCategorySlug}
      />

      {/* Trust — buyer protection signals */}
      <TrustBar />

      {/* Flash Sale — Tmall-style countdown + horizontal rail */}
      <FlashSaleSection />

      {/* Daily Vouchers — ticket-style voucher rail */}
      <DailyVouchersSection />

      {/* Top Shops — marketplace seller cards */}
      <TopShopsSection shops={topShops} />

      {/* New Arrivals — horizontal product rail */}
      <section className="aura-container py-5">
        <ProductRail
          title="Hàng mới về"
          subtitle="Sản phẩm vừa được thêm"
          href="/new-arrivals"
          products={newArrivals}
          isLoading={newArrivalsLoading}
        />
      </section>

      {/* Recommended — infinite product grid */}
      <section className="aura-container pb-10">
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Gợi ý cho bạn</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sản phẩm phù hợp để bắt đầu hôm nay.
          </p>
        </div>
        <HomeProductList selectedCategorySlug={selectedCategorySlug} />
      </section>

      {/* Service row */}
      <section className="border-t border-border bg-card">
        <div className="aura-container py-7">
          <PromoGrid />
        </div>
      </section>
    </main>
  );
}
