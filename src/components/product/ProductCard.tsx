import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import WishlistButton from "@/components/common/WishlistButton";
import { Store } from "lucide-react";

// Helper function to get price range from variants (new) or models (old)
const getPriceRange = (
  product: Product,
): { min: number; max: number } | null => {
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
const getDisplayPrice = (
  product: Product,
): { current: number; discount?: number } => {
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
  return count > 0 ? `${count} đã bán` : "Mới";
};

// Calculate discount percentage
const getDiscountPercent = (original: number, sale: number): number => {
  if (original <= 0 || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
};

// ProductCard Component - Taobao Light Style
export const ProductCard = ({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) => {
  const [imageError, setImageError] = useState(false);
  const displayPrice = getDisplayPrice(product);
  const productImage = getProductImage(product);
  const priceRange = getPriceRange(product);

  const hasDiscount =
    product.onSale &&
    displayPrice.discount &&
    displayPrice.discount < displayPrice.current;

  const discountPercent = hasDiscount
    ? getDiscountPercent(displayPrice.current, displayPrice.discount!)
    : 0;

  return (
    <Link
      href={`/products/${product.slug || product._id}`}
      className="group block h-full w-full"
    >
      <div className="flex flex-col bg-white rounded overflow-hidden border border-transparent hover:border-[#f0f0f0] hover:bg-[#fafafa] transition-all duration-200 h-full w-full">
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          {productImage && !imageError ? (
            <Image
              src={productImage}
              alt={product.name || "Hình ảnh sản phẩm"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              loading={index < 8 ? "eager" : "lazy"}
              priority={index < 4}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 gap-2 p-4">
              <Store className="w-8 h-8 opacity-20" />
              <span className="text-[10px] text-center opacity-60 line-clamp-1 px-2">
                {product.name || "Không có ảnh"}
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <WishlistButton
              productId={product._id}
              productName={product.name}
              size="sm"
            />
          </div>

          {/* Flash Sale Badge */}
          {product.flashSale && (
            <div className="absolute top-0 left-0 bg-[#E53935] text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-20 flex items-center gap-1 shadow-sm animate-pulse">
              <span className="text-xs">🔥</span> GIÁ SỐC
            </div>
          )}

          {/* Discount Badge - Orange (Only if not flash sale) */}
          {discountPercent > 0 && !product.flashSale && (
            <div className="absolute top-2 left-2 bg-[#FF9800] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              -{discountPercent}%
            </div>
          )}

          {/* New Badge */}
          {product.soldCount === 0 && (
            <div className="absolute top-2 right-2 bg-[#4CAF50] text-white text-[10px] font-bold px-1.5 py-0.5 rounded group-hover:opacity-0 transition-opacity">
              Mới
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-1 p-3 gap-2">
          {/* Product Name */}
          <h3 className="font-medium text-[13px] leading-tight text-gray-800 line-clamp-2 min-h-9 group-hover:text-[#E53935] transition-colors">
            {product.name || "Tên sản phẩm"}
          </h3>

          {/* Price Section */}
          <div className="flex flex-col gap-0.5 mt-auto">
            {/* Price Range */}
            {priceRange && priceRange.min !== priceRange.max ? (
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] text-[#E53935]">₫</span>
                <span className="font-bold text-base text-[#E53935]">
                  {priceRange.min.toLocaleString("vi-VN")}
                </span>
                <span className="text-[11px] text-gray-500">
                  - ₫{priceRange.max.toLocaleString("vi-VN")}
                </span>
              </div>
            ) : hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <div className="flex items-baseline">
                  <span className="text-[10px] text-[#E53935]">₫</span>
                  <span className="font-bold text-base text-[#E53935]">
                    {displayPrice.discount!.toLocaleString("vi-VN")}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 line-through">
                  ₫{displayPrice.current.toLocaleString("vi-VN")}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline">
                <span className="text-[10px] text-[#E53935]">₫</span>
                <span className="font-bold text-base text-[#E53935]">
                  {displayPrice.current.toLocaleString("vi-VN")}
                </span>
              </div>
            )}
          </div>

          {/* Shop & Sold Count */}
          <div className="flex items-center justify-between text-[11px] text-[#999] pt-1 border-t border-border">
            <span className="truncate max-w-[60%]">
              {product.brand ||
                (typeof product.shop === "object"
                  ? product.shop.name
                  : "Cửa hàng")}
            </span>
            <span className="shrink-0">
              {formatSoldCount(product.soldCount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
