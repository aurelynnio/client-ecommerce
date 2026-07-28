'use client';

import { useMemo } from 'react';
import { Star, ShieldCheck, Truck, Share2 } from 'lucide-react';
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
      <span className="bg-primary text-white px-2 py-0.5 rounded font-bold">FLASH SALE</span>
      <span className="text-gray-500">
        Kết thúc sau: {hours}h {minutes}m
      </span>
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
      {/* Shop Header Bar - Desktop */}
      <div className="border-b border-border hidden lg:block pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{shop?.name || 'Shop'}</span>
              {product.isFeatured && (
                <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold">
                  Mall
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">Đánh giá:</span>
                <span className="text-primary font-bold">
                  {product.ratingAverage?.toFixed(1) || '0'}
                  <Star className="w-3 h-3 inline ml-0.5 fill-current" />
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">Đã bán:</span>
                <span className="font-medium">{product.soldCount || 0}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WishlistButton productId={product._id} productName={product.name} size="sm" />
            <Button variant="outline" size="sm" className="h-7 text-xs border-border rounded-lg">
              <Share2 className="w-3.5 h-3.5 mr-1" /> Chia sẻ
            </Button>
          </div>
        </div>
      </div>

      {/* Product Name */}
      <h1 className="text-lg lg:text-xl font-bold text-foreground leading-snug">{product.name}</h1>

      {/* Rating & Sold - Mobile */}
      <div className="flex items-center gap-4 text-sm lg:hidden">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{product.ratingAverage?.toFixed(1) || '0'}</span>
          <span className="text-gray-400">({product.reviewCount || 0})</span>
        </div>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">{product.soldCount || 0} đã bán</span>
      </div>

      {/* Flash Sale Badge */}
      {product.flashSale?.isActive && <FlashSaleCountdown flashSale={product.flashSale} />}

      {/* Price Box */}
      <div className="bg-primary-light lg:bg-transparent p-4 lg:p-0 rounded-lg lg:rounded-none">
        <div className="flex items-baseline gap-2 text-primary">
          <span className="text-lg font-bold">₫</span>
          <span className="text-[36px] font-bold leading-none tracking-tight">
            {effectivePrice.toLocaleString('vi-VN')}
          </span>
          {originalPrice && originalPrice > effectivePrice && (
            <>
              <span className="text-gray-400 text-sm line-through ml-3 font-normal">
                ₫{originalPrice.toLocaleString('vi-VN')}
              </span>
              {discountPercent > 0 && (
                <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded font-bold ml-2">
                  -{discountPercent}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Delivery Badges */}
        <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
            Giao hàng 48h
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-gray-400" />
            Đổi trả miễn phí
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-gray-400" />
            Chính hãng 100%
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;
