'use client';

import Link from 'next/link';
import {
  Home,
  Zap,
  Ticket,
  Truck,
  Sparkles,
  ArrowRight,
  Gift,
  Flame,
} from 'lucide-react';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import DailyVouchersSection from '@/components/home/DailyVouchersSection';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const PROMO_CAMPAIGNS = [
  {
    title: 'Flash Sale Chớp Nhoáng',
    subtitle: 'Giảm sốc tới 50% trong khung giờ vàng hàng ngày',
    icon: Zap,
    href: '/flash-sale',
    cta: 'Săn deal ngay',
    badge: 'Đang diễn ra',
    accentBg: 'bg-primary/10 text-primary',
  },
  {
    title: 'Kho Voucher Toàn Sàn',
    subtitle: 'Lưu mã giảm giá đơn hàng và mã hoàn xu không giới hạn',
    icon: Ticket,
    href: '/vouchers',
    cta: 'Lưu mã ngay',
    badge: 'Mỗi ngày',
    accentBg: 'bg-warning/15 text-warning',
  },
  {
    title: 'Freeship Mọi Miền',
    subtitle: 'Miễn phí vận chuyển toàn quốc cho tất cả đơn từ 500.000₫',
    icon: Truck,
    href: '/free-shipping',
    cta: 'Khám phá ngay',
    badge: 'Toàn quốc',
    accentBg: 'bg-info/15 text-info',
  },
  {
    title: 'Hàng Mới Cực Hot',
    subtitle: 'Cập nhật xu hướng thời trang, công nghệ và phụ kiện mới nhất',
    icon: Sparkles,
    href: '/new-arrivals',
    cta: 'Xem bộ sưu tập',
    badge: 'Mới về',
    accentBg: 'bg-success/15 text-success',
  },
];

export default function PromotionsPage() {
  return (
    <main className="min-h-screen bg-background py-4">
      <div className="aura-container space-y-8">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  <span>Trang chủ</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Khuyến mãi</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <header className="border-b border-border pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Gift className="h-4 w-4" />
            <span>Trung tâm ưu đãi Aura Commerce</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Chương trình khuyến mãi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng hợp tất cả sự kiện giảm giá, khung giờ flash sale và mã ưu đãi đang diễn ra
          </p>
        </header>

        {/* Campaign Cards Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROMO_CAMPAIGNS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-card"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.accentBg}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {item.badge}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                <Link href={item.href} className="mt-5 block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between rounded-lg border-border group-hover:border-primary group-hover:text-primary"
                  >
                    <span>{item.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </section>

        {/* Embedded Flash Sale Section */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Flash Sale Đang Diễn Ra</h2>
            </div>
            <Link
              href="/flash-sale"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
            >
              Xem tất cả Flash Sale
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <FlashSaleSection />
        </section>

        {/* Embedded Daily Vouchers Section */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <DailyVouchersSection />
        </section>
      </div>
    </main>
  );
}
