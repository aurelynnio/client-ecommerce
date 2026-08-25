'use client';

import Link from 'next/link';
import { Zap, Ticket, Sparkles, Store } from 'lucide-react';
import Banner from './Banner';

const miniPromos = [
  {
    icon: Zap,
    title: 'Flash Sale',
    subtitle: 'Deal sốc mỗi ngày',
    href: '/flash-sale',
    accent: 'bg-primary-light text-primary',
  },
  {
    icon: Ticket,
    title: 'Voucher',
    subtitle: 'Lưu mã giảm giá',
    href: '/vouchers',
    accent: 'bg-warning/10 text-warning',
  },
  {
    icon: Sparkles,
    title: 'Hàng mới',
    subtitle: 'Sản phẩm vừa về',
    href: '/new-arrivals',
    accent: 'bg-info/10 text-info',
  },
  {
    icon: Store,
    title: 'Kênh người bán',
    subtitle: 'Mở shop ngay',
    href: '/seller',
    accent: 'bg-success/10 text-success',
  },
];

export default function BannerCarousel() {
  return (
    <section className="bg-card">
      <div className="aura-container grid gap-3 py-4 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px]">
        {/* Main carousel */}
        <div className="h-[200px] overflow-hidden rounded-lg border border-border bg-muted sm:h-[280px] lg:h-[340px]">
          <Banner />
        </div>

        {/* Mini promo grid 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {miniPromos.map(({ icon: Icon, title, subtitle, href, accent }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
