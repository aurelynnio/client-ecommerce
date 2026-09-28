'use client';

import Link from 'next/link';
import { useAppSelector } from '@/hooks/redux';
import { BRAND_CONFIG } from '@/constants';
import { Truck, Headphones, Smartphone, Store, User } from 'lucide-react';

export default function TopUtilityBar() {
  const { isAuthenticated, data } = useAppSelector((state) => state.auth);

  const linkClass =
    'inline-flex items-center gap-1 text-[11px] text-primary-foreground/80 transition-colors hover:text-primary-foreground';

  return (
    <div className="hidden bg-primary text-primary-foreground md:block">
      <div className="aura-container flex h-8 items-center justify-between">
        {/* Left — greeting / ship-to */}
        <div className="flex items-center gap-2 text-[11px] text-primary-foreground/80">
          <span>Xin chào, chào mừng đến {BRAND_CONFIG.name}</span>
        </div>

        {/* Right — quick links */}
        <nav className="flex items-center gap-4" aria-label="Tiện ích">
          {isAuthenticated ? (
            <Link href="/profile" className={linkClass}>
              <User className="h-3 w-3" aria-hidden />
              <span className="max-w-[120px] truncate">
                {data?.username || 'Tài khoản'}
              </span>
            </Link>
          ) : (
            <>
              <Link href="/login" className={linkClass}>
                Đăng nhập
              </Link>
              <Link href="/register" className={linkClass}>
                Đăng ký
              </Link>
            </>
          )}
          <Link href="/profile?tab=orders" className={linkClass}>
            <Truck className="h-3 w-3" aria-hidden />
            Đơn hàng
          </Link>
          <Link href="/seller" className={linkClass}>
            <Store className="h-3 w-3" aria-hidden />
            Kênh người bán
          </Link>
          <Link href="/support" className={linkClass}>
            <Headphones className="h-3 w-3" aria-hidden />
            CSKH
          </Link>
          <Link href="/download" className={linkClass}>
            <Smartphone className="h-3 w-3" aria-hidden />
            Tải app
          </Link>
        </nav>
      </div>
    </div>
  );
}
