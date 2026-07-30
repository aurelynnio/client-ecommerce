import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import WishlistButton from '@/components/common/WishlistButton';
import { Store, Star } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

// Helper function to get price range from variants (new) or models (old)
const getPriceRange = (product: Product): { min: number; max: number } | null => {
  if (product.variants && product.variants.length > 0) {
    const prices = product.variants.map((v) => v.price).filter((p) => p > 0);
    if (prices.length > 0) {
      return { min: Math.min(...prices), max: Math.max(...prices) };
    }
  }
  return null;
};

// Helper function to get display price
const getDisplayPrice = (product: Product): { current: number; discount?: number } => {
  const priceRange = getPriceRange(product);
  if (priceRange) {
    return { current: priceRange.min };
  }
  return {
    current: product.price?.currentPrice || 0,
    discount: product.price?.discountPrice || undefined,
  };
};

// Helper function to get product image
const getProductImage = (product: Product): string | null => {
  if (product.variants?.[0]?.images?.[0]) {
    return product.variants[0].images[0];
  }
  return null;
};

// Format sold count (Tmall/JD style: "Đã bán 1.2k")
const formatSoldCount = (count: number): string => {
  if (count >= 1000) {
    return `Đã bán ${(count / 1000).toFixed(1)}k`;
  }
  return count > 0 ? `Đã bán ${count}` : '';
};

// Calculate discount percentage
const getDiscountPercent = (original: number, sale: number): number => {
  if (original <= 0 || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
};

// Render priority badge (Tmall/JD style: no shadow, border-over)
const renderBadge = (product: Product, discountPercent: number) => {
  if (product.stock === 0) {
    return (
      <span className="rounded-sm bg-destructive px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive-foreground">
        Hết hàng
      </span>
    );
  }
  if (product.flashSale) {
    return (
      <span className="rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
        Giá sốc
      </span>
    );
  }
  if (discountPercent > 0) {
    return (
      <span className="rounded-sm bg-warning px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning-foreground">
        -{discountPercent}%
      </span>
    );
  }
  if (product.soldCount === 0) {
    return (
      <span className="rounded-sm bg-success px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success-foreground">
        Mới
      </span>
    );
  }
  return null;
};

// ProductCard Component - Tmall/JD style
export const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const [imageError, setImageError] = useState(false);
  const displayPrice = getDisplayPrice(product);
  const productImage = getProductImage(product);
  const priceRange = getPriceRange(product);

  const hasDiscount =
    product.onSale && displayPrice.discount && displayPrice.discount < displayPrice.current;

  const discountPercent = hasDiscount
    ? getDiscountPercent(displayPrice.current, displayPrice.discount!)
    : 0;

  const shopName =
    typeof product.shop === 'object' && product.shop?.name
      ? product.shop.name
      : product.brand || 'Cửa hàng';

  return (
    <Link
      href={`/products/${product.slug || product._id}`}
      className="group block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={product.name}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors duration-200 group-hover:border-primary/50">
        {/* Image Container - Tmall/JD square aspect */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted/10">
          {productImage && !imageError ? (
            <Image
              src={productImage}
              alt={product.name || 'Hình ảnh sản phẩm'}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05] motion-reduce:transform-none"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              loading={index < 8 ? 'eager' : 'lazy'}
              priority={index < 4}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/20 p-4 text-muted-foreground/40">
              <Store className="h-8 w-8 opacity-30" />
              <span className="line-clamp-1 px-2 text-center text-[10px] opacity-60">
                {product.name}
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <WishlistButton productId={product._id} productName={product.name} size="sm" />
          </div>

          {/* Badge Container */}
          <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
            {renderBadge(product, discountPercent)}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col gap-1.5 p-2.5">
          {/* Product Name */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
            {product.name || 'Tên sản phẩm'}
          </h3>

          {/* Price Section */}
          <div className="flex items-baseline gap-1.5">
            {priceRange && priceRange.min !== priceRange.max ? (
              <>
                <span className="text-base font-bold text-primary">
                  {formatCurrency(priceRange.min)}
                </span>
                <span className="text-xs text-muted-foreground">
                  - {formatCurrency(priceRange.max)}
                </span>
              </>
            ) : hasDiscount ? (
              <>
                <span className="text-base font-bold text-primary">
                  {formatCurrency(displayPrice.discount!)}
                </span>
                <span className="text-xs text-price-strikethrough line-through">
                  {formatCurrency(displayPrice.current)}
                </span>
                <span className="rounded-sm bg-warning/15 px-1 py-0.5 text-[10px] font-semibold text-warning">
                  -{discountPercent}%
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-primary">
                {formatCurrency(displayPrice.current)}
              </span>
            )}
          </div>

          {/* Rating & Sold Count */}
          <div className="mt-auto flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-star text-star" />
              <span className="font-medium">{product.ratingAverage?.toFixed(1) || '0'}</span>
            </span>
            <span className="shrink-0 font-medium">{formatSoldCount(product.soldCount)}</span>
          </div>

          {/* Shop Name */}
          <p className="truncate border-t border-border/50 pt-1.5 text-[11px] text-muted-foreground/80">
            {shopName}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
