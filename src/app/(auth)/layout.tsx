import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { BRAND_CONFIG } from '@/constants';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left: Brand Panel (desktop only, Tmall/JD style) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Decorative pattern overlay (subtle, no gradient) */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <div className="relative h-16 w-[120px]">
            <Image
              src="/images/logo-aura.svg"
              alt={BRAND_CONFIG.name}
              fill
              sizes="120px"
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Slogan + Benefits */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-tight text-primary-foreground">
              Mua sắm thông minh,
              <br />
              sống trọn niềm vui
            </h2>
            <p className="max-w-md text-sm text-primary-foreground/80">
              Hàng triệu sản phẩm chính hãng, giá tốt mỗi ngày. Tham gia cộng đồng mua sắm an toàn và
              tiện lợi.
            </p>
          </div>

          {/* Benefits */}
          <ul className="grid grid-cols-2 gap-4 text-sm">
            <li className="flex items-center gap-2 text-primary-foreground/90">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span>Bảo vệ người mua</span>
            </li>
            <li className="flex items-center gap-2 text-primary-foreground/90">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10">
                <Truck className="h-4 w-4" />
              </span>
              <span>Giao hàng nhanh chóng</span>
            </li>
            <li className="flex items-center gap-2 text-primary-foreground/90">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10">
                <RotateCcw className="h-4 w-4" />
              </span>
              <span>Đổi trả 7 ngày</span>
            </li>
            <li className="flex items-center gap-2 text-primary-foreground/90">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10">
                <Headphones className="h-4 w-4" />
              </span>
              <span>Hỗ trợ 24/7</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} {BRAND_CONFIG.name}. Bảo lưu mọi quyền.
        </p>
      </div>

      {/* Right: Form Panel */}
      <div className="flex w-full flex-col items-center justify-center p-4 lg:w-1/2">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="flex flex-col items-center">
            <div className="relative h-16 w-[120px]">
              <Image
                src="/images/logo-aura.svg"
                alt={BRAND_CONFIG.name}
                fill
                sizes="120px"
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Form card (border-over-shadow rule) */}
        <div className="w-full max-w-[400px] rounded-lg border border-border bg-card p-6 text-card-foreground lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
