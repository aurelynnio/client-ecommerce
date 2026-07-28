import Link from 'next/link';
import Image from 'next/image';
import { BRAND_CONFIG } from '@/constants';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Link href="/" className="flex flex-col items-center">
          <div className="relative h-14 w-44">
            <Image
              src="/images/logo-aura-light.png"
              alt={BRAND_CONFIG.name}
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>
      <div className="w-full max-w-[400px] rounded-lg border border-border bg-card p-8 text-card-foreground shadow-sm">
        {children}
      </div>
    </div>
  );
}
