"use client";
import { useCallback, useEffect } from "react";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/hooks/hooks";
import {
  useWishlist,
  useRemoveFromWishlist,
} from "@/hooks/queries/useWishlist";
import { useAddToCart } from "@/hooks/queries/useCart";
import { Product } from "@/types/product";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { useRouter } from "next/navigation";
import { getSafeErrorMessage } from "@/api";

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: wishlistData, isLoading } = useWishlist({ page: 1, limit: 20 });
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const addToCartMutation = useAddToCart();

  // Extract items from React Query response
  const items = wishlistData?.data || [];
  const pagination = wishlistData?.pagination;

  const handleRemoveItem = useCallback(
    async (productId: string) => {
      try {
        await removeFromWishlistMutation.mutateAsync(productId);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } catch (error) {
        toast.error(getSafeErrorMessage(error, "Có lỗi xảy ra"));
      }
    },
    [removeFromWishlistMutation],
  );

  const handleAddToCart = useCallback(
    async (product: Product) => {
      try {
        const shopId =
          typeof product.shop === "object" ? product.shop._id : product.shop;
        await addToCartMutation.mutateAsync({
          productId: product._id,
          shopId: shopId || "",
          quantity: 1,
        });
        toast.success("Đã thêm vào giỏ hàng");
      } catch (error) {
        toast.error(getSafeErrorMessage(error, "Không thể thêm vào giỏ hàng"));
      }
    },
    [addToCartMutation],
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login?redirect=/wishlist");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Loading state
  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <SpinnerLoading size={32} />
      </div>
    );
  }

  // Empty State
  if (!isLoading && items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md space-y-4"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#f0f0f0]">
            <Heart className="h-10 w-10 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">
              Chưa có sản phẩm yêu thích
            </h2>
            <p className="text-gray-500 text-sm">
              Hãy thêm sản phẩm vào danh sách yêu thích của bạn
            </p>
          </div>
          <Link href="/products" className="block pt-4">
            <Button className="rounded bg-[#E53935] hover:bg-[#D32F2F] px-8 h-10 text-sm">
              Khám phá sản phẩm <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 -mt-4 -mx-4 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded border border-[#f0f0f0] mb-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-[#E53935]" />
              <h1 className="text-xl font-bold text-gray-800">
                Sản phẩm yêu thích
              </h1>
              <span className="text-sm text-gray-500">
                ({pagination?.totalItems || items.length} sản phẩm)
              </span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const price =
                item.price?.discountPrice || item.price?.currentPrice || 0;
              const originalPrice = item.price?.currentPrice || 0;
              const hasDiscount =
                item.price?.discountPrice &&
                item.price.discountPrice < originalPrice;
              // Get image from: variants[0].images[0] -> placeholder
              const productImage =
                item.variants?.[0]?.images?.[0] || "/images/placeholder.png";
              const shopName =
                typeof item.shop === "object" ? item.shop?.name : "Shop";

              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded border border-transparent hover:border-[#f0f0f0] hover:bg-[#fafafa] transition-all duration-200 overflow-hidden group"
                >
                  {/* Image */}
                  <Link href={`/products/${item.slug || item._id}`}>
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <Image
                        src={productImage}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                      {/* Remove Button */}
                      <button
                        aria-label={`Xóa ${item.name} khỏi danh sách yêu thích`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveItem(item._id);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
                      </button>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3">
                    <Link href={`/products/${item.slug || item._id}`}>
                      <h3 className="text-[13px] text-gray-800 line-clamp-2 min-h-9 group-hover:text-[#E53935] transition-colors">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-[10px] text-[#E53935]">₫</span>
                      <span className="font-bold text-base text-[#E53935]">
                        {price.toLocaleString("vi-VN")}
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] text-gray-400 line-through ml-1">
                          ₫{originalPrice.toLocaleString("vi-VN")}
                        </span>
                      )}
                    </div>

                    {/* Shop */}
                    <p className="text-[11px] text-[#999] mt-1 truncate">
                      {shopName}
                    </p>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={() => handleAddToCart(item)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 h-8 text-xs border-[#E53935] text-[#E53935] hover:bg-[#FFEBEE] hover:text-[#E53935]"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                      Thêm vào giỏ
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
