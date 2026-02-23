"use client";
import FlashSaleSection from "@/components/product/FlashSaleSection";
import { useAppSelector } from "@/hooks/hooks";
import { cn } from "@/utils/cn";
import { Zap } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { useFlashSaleWithCountdown } from "@/hooks/queries/useFlashSale";
import SpinnerLoading from "@/components/common/SpinnerLoading";

export default function FlashSalePage() {
  const { isOpen: isChatOpen } = useAppSelector((state) => state.chat);
  const { products = [], isLoading, error } = useFlashSaleWithCountdown();

  return (
    <main className="w-full min-h-screen bg-gray-50 py-8">
      <div
        className={cn(
          "mx-auto px-4 transition-all duration-300",
          isChatOpen ? "max-w-full" : "container max-w-[1400px]",
        )}
      >
        <div className="flex items-center gap-3 mb-8 bg-linear-to-r from-[#E53935] to-[#FF5722] p-6 rounded-2xl text-white shadow-lg">
          <Zap className="h-10 w-10 fill-current" />
          <div>
            <h1 className="text-3xl font-bold">FLASH SALE</h1>
            <p className="opacity-90">Săn deal hời, giá cực sốc mỗi ngày</p>
          </div>
        </div>

        <FlashSaleSection />

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#E53935] rounded-full"></span>
            Tất cả sản phẩm đang giảm giá
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <SpinnerLoading size={40} />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-gray-500">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              Hiện không có sản phẩm nào trong chương trình Flash Sale.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
