'use client';

import Link from 'next/link';
import { Zap, Ticket, Flame, Store, User, Package, ChevronRight, Megaphone } from 'lucide-react';
import { useAppSelector } from '@/hooks/redux';
import Banner from './Banner';

const fastShortcuts = [
  {
    icon: Zap,
    title: 'Flash Sale',
    href: '/flash-sale',
    color: 'text-primary bg-primary-light group-hover:bg-primary group-hover:text-primary-foreground',
  },
  {
    icon: Ticket,
    title: 'Kho Voucher',
    href: '/vouchers',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 group-hover:bg-amber-500 group-hover:text-white',
  },
  {
    icon: Flame,
    title: 'Hàng mới',
    href: '/new-arrivals',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 group-hover:bg-orange-500 group-hover:text-white',
  },
  {
    icon: Store,
    title: 'Người bán',
    href: '/seller',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 group-hover:bg-emerald-500 group-hover:text-white',
  },
];

export default function BannerCarousel() {
  const { isAuthenticated, data: user } = useAppSelector((state) => state.auth);

  return (
    <section className="bg-card">
      <div className="aura-container grid gap-3 py-4 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px]">
        {/* Main carousel */}
        <div className="h-[200px] overflow-hidden rounded-lg border border-border bg-muted sm:h-[280px] lg:h-[340px]">
          <Banner />
        </div>

        {/* Member & Fast Action Portal Card */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-3.5 shadow-2xs">
          {/* User / Member Greeting */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-foreground font-semibold">
                {isAuthenticated && user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.username || 'User'}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {isAuthenticated
                    ? `Xin chào, ${user?.username || 'Bạn'}!`
                    : 'Chào mừng bạn đến với Nantian!'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAuthenticated ? 'Thành viên thân thiết' : 'Đăng nhập để nhận trọn ưu đãi'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile?tab=orders"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
                  >
                    <Package className="h-3.5 w-3.5 text-primary" />
                    <span>Đơn mua</span>
                  </Link>
                  <Link
                    href="/profile?tab=vouchers"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
                  >
                    <Ticket className="h-3.5 w-3.5 text-amber-500" />
                    <span>Ví Voucher</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex-1 rounded-lg bg-primary py-1.5 text-center text-xs font-medium text-primary-foreground shadow-2xs transition-colors hover:bg-primary-hover"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 rounded-lg border border-border bg-background py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Bulletin / Notice Strip */}
          <Link
            href="/promotions"
            className="group my-3 flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Megaphone className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">Freeship đơn từ 500.000₫ toàn quốc</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
          </Link>

          {/* 4-item Fast Shortcut Bar */}
          <div className="border-t border-border/70 pt-2.5">
            <div className="grid grid-cols-4 gap-1 text-center">
              {fastShortcuts.map(({ icon: Icon, title, href, color }) => (
                <Link
                  key={title}
                  href={href}
                  className="group flex flex-col items-center gap-1.5 rounded-md p-1.5 transition-colors hover:bg-muted/40"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${color}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-medium text-foreground group-hover:text-primary transition-colors">
                    {title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

