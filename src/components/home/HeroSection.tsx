'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Banner from './Banner';

/** Homepage's only dominant section: concise editorial copy and one campaign visual. */
export default function HeroSection() {
  return (
    <section className="border-b border-border bg-card">
      <div className="aura-container grid gap-8 py-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:py-12 lg:gap-14">
        <div className="max-w-xl">
          <p className="mb-3 text-sm font-medium text-primary">Aura Commerce</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Những lựa chọn tốt hơn, cho nhịp sống hằng ngày.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            Khám phá sản phẩm được chọn lọc rõ ràng, mua sắm nhanh gọn và theo dõi đơn hàng trong
            một trải nghiệm nhẹ nhàng.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Khám phá sản phẩm <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/new-arrivals"
              className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Hàng mới về
            </Link>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Thanh toán an toàn · Hỗ trợ đơn hàng rõ ràng
          </p>
        </div>
        <div className="h-[260px] overflow-hidden rounded-xl border border-border bg-muted sm:h-[320px] w-full relative">
          <Banner />
        </div>
      </div>
    </section>
  );
}
