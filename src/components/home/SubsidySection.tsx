'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import { useFlashSaleWithCountdown } from '@/hooks/queries/useFlashSale';
import { formatCurrency } from '@/utils/format';

const emptyFlashSaleItems = [
  {
    image: '/images/flash-sale-placeholder-1.svg',
    label: 'Deal thời trang',
    price: 'Từ 99K',
  },
  {
    image: '/images/flash-sale-placeholder-2.svg',
    label: 'Đồ công nghệ',
    price: 'Giảm sâu',
  },
  {
    image: '/images/flash-sale-placeholder-3.svg',
    label: 'Phụ kiện hot',
    price: 'Mua là hời',
  },
  {
    image: '/images/flash-sale-placeholder-4.svg',
    label: 'Gia dụng mới',
    price: 'Ưu đãi sốc',
  },
];

export default function SubsidySection() {
  const { products, formattedCountdown, isLoading } = useFlashSaleWithCountdown();
  const displayProducts = products.slice(0, 4);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary fill-primary" />
          <h3 className="text-base font-semibold text-foreground">Ưu đãi chớp nhoáng</h3>
          <span className="rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            {formattedCountdown.hours}:{formattedCountdown.minutes}:{formattedCountdown.seconds}
          </span>
        </div>
        <Link
          href="/flash-sale"
          className="flex items-center gap-1 text-muted-foreground text-xs hover:text-primary transition-colors font-medium"
        >
          Xem tất cả
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/40 bg-card p-2 animate-pulse"
              >
                <div className="w-full aspect-square bg-muted rounded-md mb-2" />
                <div className="h-3 bg-muted rounded mb-1" />
                <div className="h-2 bg-muted rounded w-2/3 mx-auto" />
              </div>
            ))
          : displayProducts.length > 0
            ? displayProducts.map((product) => {
                const image =
                  product.variants?.[0]?.images?.[0] || '/images/placeholder-product.svg';
                const salePrice = product.flashSaleInfo?.salePrice || 0;
                const originalPrice = product.flashSaleInfo?.originalPrice || 0;
                const discount = product.flashSaleInfo?.discount || 0;

                return (
                  <Link
                    key={product._id}
                    href={`/products/${product.slug || product._id}`}
                    className="group flex flex-col rounded-lg border border-border/60 bg-card p-2 transition-colors hover:border-primary/40"
                  >
                    {/* Product Image */}
                    <div className="relative w-full aspect-square mb-2 overflow-hidden rounded bg-muted/40">
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                      {discount > 0 && (
                        <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-bold">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex flex-col items-center w-full min-w-0">
                      <div className="text-primary text-sm font-bold truncate w-full text-center">
                        {formatCurrency(salePrice)}
                      </div>
                      {originalPrice > salePrice && (
                        <span className="text-[10px] text-muted-foreground line-through truncate w-full text-center">
                          {formatCurrency(originalPrice)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })
            : emptyFlashSaleItems.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-between rounded-lg border border-border/80 bg-card p-2 shadow-xs"
                >
                  <div className="relative w-full aspect-square mb-2 overflow-hidden rounded bg-primary-light">
                    <Image src={item.image} alt={item.label} fill className="object-cover" />
                  </div>
                  <div className="w-full text-center min-w-0">
                    <p className="text-[11px] font-medium text-foreground truncate">{item.label}</p>
                    <p className="text-xs font-bold text-primary">{item.price}</p>
                  </div>
                </div>
              ))}
      </div>
    </div>
  );
}
