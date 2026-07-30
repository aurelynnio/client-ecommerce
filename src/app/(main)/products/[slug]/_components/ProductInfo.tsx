'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, Truck, Share2, Tag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, Price, FlashSaleInfo } from '@/types/product';
import { Shop } from '@/types/shop';
import WishlistButton from '@/components/common/WishlistButton';

interface ProductInfoProps {
  product: Product;
  activePrice: Price | null;
  shop: Shop | null;
}

// Flash Sale Countdown Component
function FlashSaleCountdown({ flashSale }: { flashSale: FlashSaleInfo }) {
  // Simple countdown display - could be enhanced with real-time countdown
  const endTime = flashSale.endTime ? new Date(flashSale.endTime) : null;
  const now = new Date();

  if (!endTime || endTime <= now) return null;

  const diff = endTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="rounded bg-primary px-2 py-0.5 font-bold text-primary-foreground">
        FLASH SALE
      </span>
      <span className="text-muted-foreground">Kết thúc sau: {hours}h {minutes}m</span>
    </div>
  );
}

export function ProductInfo({ product, activePrice, shop }: ProductInfoProps) {
  // Calculate discount percentage
  const discountPercent = useMemo(() => {
    if (!activePrice?.discountPrice || !activePrice?.currentPrice) return 0;
    if (activePrice.discountPrice >= activePrice.currentPrice) return 0;
    return Math.round(
      ((activePrice.currentPrice - activePrice.discountPrice) / activePrice.currentPrice) * 100,
    );
  }, [activePrice]);

  // Get effective price (considering flash sale)
  const effectivePrice = useMemo(() => {
    if (product.flashSale?.isActive && product.flashSale.salePrice) {
      return product.flashSale.salePrice;
    }
    return activePrice?.currentPrice || 0;
  }, [product.flashSale, activePrice]);

  const originalPrice = useMemo(() => {
    if (product.flashSale?.isActive) {
      return activePrice?.currentPrice || 0;
    }
    return activePrice?.discountPrice || null;
  }, [product.flashSale, activePrice]);

  return (
    <div className="space-y-4">
      {/* Shop Header Bar - Desktop (Tmall/JD style) */}
      <div className="hidden border-b border-border pb-3 lg:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shop?.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="h-8 w-8 rounded border border-border object-cover"
              />
            ) : null}
            <Link
              href={shop?.slug ? `/shop/${shop.slug}` : '#'}
              className="text-sm font-bold text-foreground transition-colors hover:text-primary"
            >
              {shop?.name || 'Shop'}
            </Link>
            {product.isFeatured && (
              <span className="rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                Mall
              </span>
            )}
            <span className="text-muted-foreground/40">|</span>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-star text-star" />
                <span className="font-bold text-foreground">
                  {product.ratingAverage?.toFixed(1) || '0'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground/60">Đã bán</span>
                <span className="font-medium text-foreground">{product.soldCount || 0}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WishlistButton productId={product._id} productName={product.name} size="sm" />
            <Button variant="outline" size="sm" className="h-7 rounded-lg border-border text-xs">
              <Share2 className="mr-1 h-3.5 w-3.5" /> Chia sẻ
            </Button>
            {shop?.slug && (
              <Link href={`/shop/${shop.slug}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-lg border-border text-xs"
                >
                  Xem shop
                  <ChevronRight className="ml-0.5 h-3 w-3" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Product Name */}
      <h1 className="text-lg font-bold leading-snug text-foreground lg:text-xl">
        {product.name}
      </h1>

      {/* Rating & Sold - Mobile */}
      <div className="flex items-center gap-3 text-sm lg:hidden">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-star text-star" />
          <span className="font-medium">{product.ratingAverage?.toFixed(1) || '0'}</span>
          <span className="text-muted-foreground/60">({product.reviewCount || 0} đánh giá)</span>
        </div>
        <span className="text-muted-foreground/40">|</span>
        <span className="text-muted-foreground">{product.soldCount || 0} đã bán</span>
      </div>

      {/* Flash Sale Badge */}
      {product.flashSale?.isActive && <FlashSaleCountdown flashSale={product.flashSale} />}

      {/* Price Box (Tmall/JD style with light tint background) */}
      <div className="rounded-lg bg-primary-light p-4">
        <div className="flex flex-wrap items-baseline gap-2 text-primary">
          <span className="text-lg font-bold">₫</span>
          <span className="text-[36px] font-bold leading-none tracking-tight">
            {effectivePrice.toLocaleString('vi-VN')}
          </span>
          {originalPrice && originalPrice > effectivePrice && (
            <>
              <span className="ml-2 text-sm font-normal text-price-strikethrough line-through">
                ₫{originalPrice.toLocaleString('vi-VN')}
              </span>
              {discountPercent > 0 && (
                <span className="ml-1 rounded bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
                  -{discountPercent}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Ưu đãi section (Tmall/JD style) */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-primary/10 pt-3 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Tag className="h-3.5 w-3.5 text-primary" />
            Ưu đãi:
          </span>
          <span className="rounded border border-success/30 bg-success/10 px-1.5 py-0.5 font-medium text-success">
            Freeship
          </span>
          <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
            Giảm giá
          </span>
        </div>

        {/* Delivery Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Giao hàng 48h
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-primary" />
            Đổi trả miễn phí
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-primary" />
            Chính hãng 100%
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;
