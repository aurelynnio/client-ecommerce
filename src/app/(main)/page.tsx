'use client';

import { useState } from 'react';
import HeroSection from '@/components/home/HeroSection';
import Category from '@/components/category/Category';
import HomeProductList from '@/components/home/HomeProductList';
import SubsidySection from '@/components/home/SubsidySection';
import PromoGrid from '@/components/home/PromoGrid';

export default function Home() {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <section className="border-b border-border bg-card">
        <div className="aura-container py-7 sm:py-9">
          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight">Khám phá theo danh mục</h2>
            <p className="mt-1 text-sm text-muted-foreground">Bắt đầu từ điều bạn đang tìm kiếm.</p>
          </div>
          <Category
            selectedSlug={selectedCategorySlug}
            onSelectCategory={setSelectedCategorySlug}
          />
        </div>
      </section>
      <section className="aura-container py-8 sm:py-10">
        <SubsidySection />
      </section>
      <section className="aura-container pb-10">
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight">Gợi ý cho bạn</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sản phẩm phù hợp để bắt đầu hôm nay.</p>
        </div>
        <HomeProductList selectedCategorySlug={selectedCategorySlug} />
      </section>
      <section className="border-t border-border bg-card">
        <div className="aura-container py-7">
          <PromoGrid />
        </div>
      </section>
    </main>
  );
}
