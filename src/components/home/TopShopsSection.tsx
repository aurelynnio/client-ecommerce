'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Store, Star, Users, ArrowRight } from 'lucide-react';
import { Shop } from '@/types/shop';

interface TopShopsSectionProps {
  shops: Shop[];
}

export default function TopShopsSection({ shops }: TopShopsSectionProps) {
  const displayShops = shops.slice(0, 6);

  if (displayShops.length === 0) return null;

  return (
    <section className="bg-card">
      <div className="aura-container py-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-foreground">Cửa hàng nổi bật</h2>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
          >
            Xem tất cả
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {displayShops.map((shop) => (
            <Link
              key={shop._id}
              href={`/shop/${shop.slug}`}
              className="group flex flex-col items-center rounded-lg border border-border bg-card p-3 text-center transition-colors hover:border-primary/40"
            >
              <div className="relative mb-2 h-14 w-14 overflow-hidden rounded-full border-2 border-border bg-muted">
                {shop.logo ? (
                  <Image
                    src={shop.logo}
                    alt={shop.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Store className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="line-clamp-1 text-xs font-medium text-foreground group-hover:text-primary">
                {shop.name}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-star text-star" aria-hidden="true" />
                  {shop.rating?.toFixed(1) || '0.0'}
                </span>
                <span className="flex items-center gap-0.5">
                  <Users className="h-2.5 w-2.5" aria-hidden="true" />
                  {shop.followerCount || 0}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
