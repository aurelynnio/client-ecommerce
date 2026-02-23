"use client";
import { memo } from "react";

import Link from "next/link";
import Image from "next/image";
import { Zap, ChevronRight } from "lucide-react";
import { useFlashSaleWithCountdown } from "@/hooks/queries/useFlashSale";
import { FlashSaleProduct } from "@/types/flash-sale";
import SpinnerLoading from "@/components/common/SpinnerLoading";

// Countdown Timer Component
const CountdownTimer = memo(function CountdownTimer({
  seconds,
}: {
  seconds: number;
}) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center gap-1">
      <TimeBox value={hours} />
      <span className="text-[#E53935] font-bold">:</span>
      <TimeBox value={minutes} />
      <span className="text-[#E53935] font-bold">:</span>
      <TimeBox value={secs} />
    </div>
  );
});

const TimeBox = memo(function TimeBox({ value }: { value: number }) {
  return (
    <span className="bg-[#E53935] text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-6 text-center">
      {value.toString().padStart(2, "0")}
    </span>
  );
});

// Progress Bar Component
const SoldProgress = memo(function SoldProgress({
  percent,
}: {
  percent: number;
}) {
  return (
    <div className="relative h-4 bg-[#FFCDD2] rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-linear-to-r from-[#FF5722] to-[#E53935] rounded-full transition-all duration-300"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
        {percent >= 50 ? `Đã bán ${percent}%` : "Đang bán chạy"}
      </span>
    </div>
  );
});

// Flash Sale Product Card
const FlashSaleCard = memo(function FlashSaleCard({
  product,
}: {
  product: FlashSaleProduct;
}) {
  const { flashSaleInfo } = product;
  const productImage =
    product.variants?.[0]?.images?.[0] || "/images/placeholder.png";

  return (
    <Link
      href={`/products/${product.slug || product._id}`}
      className="shrink-0 w-[140px] sm:w-40 bg-white rounded-lg overflow-hidden border border-transparent hover:border-[#FFCDD2] transition-all group"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={productImage}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="160px"
        />
        {/* Discount Badge */}
        {flashSaleInfo?.discount > 0 && (
          <div className="absolute top-0 right-0 bg-[#E53935] text-white text-[10px] font-bold px-2 py-1">
            -{flashSaleInfo.discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] text-[#E53935]">₫</span>
          <span className="font-bold text-sm text-[#E53935]">
            {(flashSaleInfo?.salePrice || 0).toLocaleString("vi-VN")}
          </span>
        </div>
        {flashSaleInfo?.originalPrice > flashSaleInfo?.salePrice && (
          <span className="text-[10px] text-gray-400 line-through">
            ₫{flashSaleInfo.originalPrice.toLocaleString("vi-VN")}
          </span>
        )}

        {/* Progress */}
        <div className="mt-2">
          <SoldProgress percent={flashSaleInfo?.soldPercent || 0} />
        </div>
      </div>
    </Link>
  );
});

// Main Flash Sale Section
export const FlashSaleSection = memo(function FlashSaleSection() {
  const { products, isLoading, error, countdown } = useFlashSaleWithCountdown();

  // Use countdown from the hook directly
  const remainingSeconds = countdown;

  if (error || (!isLoading && products.length === 0)) {
    return null; // Don't show section if no flash sale
  }

  return (
    <section className="bg-linear-to-r from-[#FFEBEE] to-[#FCE4EC] rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#E53935]">
            <Zap className="h-5 w-5 fill-current" />
            <span className="font-bold text-lg">GIÁ SỐC</span>
          </div>

          {remainingSeconds > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Kết thúc trong</span>
              <CountdownTimer seconds={remainingSeconds} />
            </div>
          )}
        </div>

        <Link
          href="/flash-sale"
          className="flex items-center gap-1 text-sm text-[#E53935] hover:underline"
        >
          Xem tất cả
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <SpinnerLoading size={24} />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {products.slice(0, 10).map((product) => (
            <FlashSaleCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
});

export default FlashSaleSection;
