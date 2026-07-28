import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import WishlistButton from '@/components/common/WishlistButton';
import { Store } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

// Helper function to get price range from variants (new) or models (old)
const getPriceRange = (product: Product): { min: number; max: number } | null => {
  // New structure: variants with price
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
  // New structure: variants with images (primary source)
  if (product.variants?.[0]?.images?.[0]) {
    return product.variants[0].images[0];
  }

  return null;
};

// Format sold count
const formatSoldCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k đã bán`;
  }
  return count > 0 ? `${count} đã bán` : 'Mới';
};

// Calculate discount percentage
const getDiscountPercent = (original: number, sale: number): number => {
  if (original <= 0 || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
};

// Render priority badge
const renderBadge = (product: Product, discountPercent: number) => {
  if (product.stock === 0) {
    return (
      <span className="bg-neutral-900 text-white text-[9px] font-semibold px-2 py-0.5 rounded-sm tracking-wide uppercase shadow-xs">
        Hết hàng
      </span>
    );
  }
  if (product.flashSale) {
    return (
      <span className="bg-primary text-white text-[9px] font-semibold px-2 py-0.5 rounded-sm tracking-wide uppercase shadow-xs">
        Giá sốc
      </span>
    );
  }
  if (discountPercent > 0) {
    return (
      <span className="bg-amber-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded-sm tracking-wide uppercase shadow-xs">
        -{discountPercent}%
      </span>
    );
  }
  if (product.soldCount === 0) {
    return (
      <span className="bg-emerald-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded-sm tracking-wide uppercase shadow-xs">
        Mới
      </span>
    );
  }
  return null;
};

// ProductCard Component - Aura Elegant Style
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

  return (
    <Link href={`/products/${product.slug || product._id}`} className="group block h-full w-full">
      <div className="flex h-full w-full flex-col gap-2.5">
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted/10">
          {productImage && !imageError ? (
            <Image
              src={productImage}
              alt={product.name || 'Hình ảnh sản phẩm'}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading={index < 8 ? 'eager' : 'lazy'}
              priority={index < 4}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 text-muted-foreground/40 gap-2 p-4">
              <Store className="w-6 h-6 opacity-30" />
              <span className="text-[10px] text-center opacity-60 line-clamp-1 px-2">
                {product.name}
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <WishlistButton productId={product._id} productName={product.name} size="sm" />
          </div>

          {/* Badge Container */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {renderBadge(product, discountPercent)}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-1.5 px-0.5">
          {/* Shop/Brand Info */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
            {product.brand || (typeof product.shop === 'object' ? product.shop.name : 'Cửa hàng')}
          </span>

          {/* Product Name */}
          <h3 className="font-normal text-[13px] text-foreground leading-snug line-clamp-2 min-h-9 group-hover:text-primary transition-colors duration-200">
            {product.name || 'Tên sản phẩm'}
          </h3>

          {/* Price Section */}
          <div className="flex flex-col gap-0.5">
            {priceRange && priceRange.min !== priceRange.max ? (
              <div className="flex items-baseline gap-1">
                <span className="font-medium text-[14px] text-primary">
                  {formatCurrency(priceRange.min)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  - {formatCurrency(priceRange.max)}
                </span>
              </div>
            ) : hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-[14px] text-primary">
                  {formatCurrency(displayPrice.discount!)}
                </span>
                <span className="text-[11px] text-muted-foreground line-through">
                  {formatCurrency(displayPrice.current)}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline">
                <span className="font-medium text-[14px] text-primary">
                  {formatCurrency(displayPrice.current)}
                </span>
              </div>
            )}
          </div>

          {/* Shop & Sold Count */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 pt-1 border-t border-border/30 mt-1">
            <span className="truncate max-w-[60%] font-medium">
              {product.brand || (typeof product.shop === 'object' ? product.shop.name : 'Cửa hàng')}
            </span>
            <span className="shrink-0 font-medium">{formatSoldCount(product.soldCount)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
