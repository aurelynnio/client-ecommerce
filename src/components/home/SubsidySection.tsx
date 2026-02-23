"use client";
import Image from "next/image";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { useFlashSaleWithCountdown } from "@/hooks/queries/useFlashSale";
import { formatCurrency } from "@/utils/format";

export default function SubsidySection() {
  const { products, formattedCountdown, isLoading } = useFlashSaleWithCountdown();
  const displayProducts = products.slice(0, 4);

  return (
    <div className="w-full h-full bg-[#f7f7f7] rounded-lg p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#E53935] fill-[#E53935]" />
          <h3 className="text-base font-bold text-[#E53935]">Giá sốc chớp nhoáng</h3>
          <span className="bg-[#E53935] text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
            Kết thúc sau {formattedCountdown.hours}:{formattedCountdown.minutes}:{formattedCountdown.seconds}
          </span>
        </div>
        <Link 
          href="/flash-sale" 
          className="flex items-center gap-1 text-gray-600 text-xs hover:text-[#E53935] transition-colors"
        >
          Xem tất cả
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Products Grid */}
      <div className="flex-1 grid grid-cols-4 gap-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-2 animate-pulse"
            >
              <div className="w-full aspect-square bg-gray-100 rounded-md mb-2" />
              <div className="h-3 bg-gray-100 rounded mb-1" />
              <div className="h-2 bg-gray-100 rounded w-2/3 mx-auto" />
            </div>
          ))
        ) : displayProducts.length > 0 ? (
          displayProducts.map((product) => {
            const image = product.variants?.[0]?.images?.[0] || "/images/placeholder.png";
            const salePrice = product.flashSaleInfo?.salePrice || 0;
            const originalPrice = product.flashSaleInfo?.originalPrice || 0;
            const discount = product.flashSaleInfo?.discount || 0;

            return (
              <Link
                key={product._id}
                href={`/products/${product.slug || product._id}`}
                className="flex flex-col items-center group cursor-pointer bg-white rounded-lg p-2 hover:shadow-lg transition-all duration-200"
              >
                {/* Product Image */}
                <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-md">
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {discount > 0 && (
                    <span className="absolute top-1 left-1 bg-[#E53935] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                      -{discount}%
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex flex-col items-center w-full">
                  <div className="text-[#E53935] text-sm font-bold">
                    {formatCurrency(salePrice)}
                  </div>
                  {originalPrice > salePrice && (
                    <span className="text-[10px] text-gray-400 line-through">
                      {formatCurrency(originalPrice)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-4 flex items-center justify-center text-xs text-gray-500">
            Chưa có sản phẩm flash sale
          </div>
        )}
      </div>
    </div>
  );
}
