"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  Star,
  Users,
  MessageCircle,
  Clock,
  Truck,
  Search,
  Grid3X3,
  List,
} from "lucide-react";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/product/ProductCard";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useShopBySlug, useShopCategories } from "@/hooks/queries/useShop";
import { useInfiniteShopProducts } from "@/hooks/queries/useProducts";
import { useStartConversation } from "@/hooks/queries";
import { setChatOpen } from "@/features/chat/chatSlice";

export default function ShopPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const slug = params.slug as string;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data: currentShop,
    isLoading: shopLoading,
    error: shopError,
  } = useShopBySlug(slug);
  const { data: categoriesData, isLoading: categoriesLoading } =
    useShopCategories(currentShop?._id || "", { enabled: !!currentShop?._id });
  
  const categories = categoriesData?.categories || [];
  const totalProducts = categoriesData?.totalProducts || 0;

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Use infinite scroll for products with server-side filtering
  const {
    data: productsData,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteShopProducts(currentShop?._id || "", {
    limit: 24,
    shopCategory: activeCategory === "all" ? undefined : activeCategory,
  });

  // Flatten all pages into single array
  const allProducts = useMemo(() => {
    return productsData?.pages.flatMap((page) => page.products) || [];
  }, [productsData]);

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const startConversationMutation = useStartConversation();

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? "Đã bỏ theo dõi shop" : "Đã theo dõi shop");
  };

  const handleChat = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để chat với shop");
      return;
    }
    if (!currentShop?._id) return;

    try {
      await startConversationMutation.mutateAsync({ shopId: currentShop._id });
      dispatch(setChatOpen(true));
    } catch {
      toast.error("Không thể bắt đầu cuộc trò chuyện");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Client-side search filtering (optional, can also move to server-side)
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return allProducts;
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProducts, searchQuery]);

  if (shopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerLoading size={32} />
      </div>
    );
  }

  if (shopError || !currentShop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">
            {shopError instanceof Error
              ? shopError.message
              : shopError || "Không tìm thấy shop"}
          </p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background -mt-4 -mx-4">
      {/* Shop Banner */}
      <div className="relative h-[200px] md:h-[280px] w-full">
        <Image
          src={currentShop.banner || "/images/default-banner.jpg"}
          alt={currentShop.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Shop Info Card */}
      <div className="max-w-[1200px] mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded border border-[#f0f0f0] p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Logo */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shrink-0 mx-auto md:mx-0">
              <Image
                src={currentShop.logo || "/images/default-shop.png"}
                alt={currentShop.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                <h1 className="text-xl font-bold text-gray-800">
                  {currentShop.name}
                </h1>
                <span className="inline-flex items-center justify-center md:justify-start gap-1 text-xs text-[#E53935] border border-[#E53935] px-2 py-0.5 rounded w-fit mx-auto md:mx-0">
                  <Store className="h-3 w-3" />
                  Official Store
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {currentShop.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{currentShop.rating}</span>
                  <span className="text-gray-400">
                    ({formatNumber(currentShop.metrics?.ratingCount || 0)} đánh
                    giá)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {formatNumber(currentShop.followerCount || 0)}
                  </span>
                  <span className="text-gray-400">theo dõi</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 justify-center md:justify-end shrink-0">
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                className={
                  isFollowing
                    ? "border-[#E53935] text-[#E53935] hover:bg-[#FFEBEE]"
                    : "bg-[#E53935] hover:bg-[#D32F2F]"
                }
              >
                {isFollowing ? "Đang theo dõi" : "+ Theo dõi"}
              </Button>
              <Button
                variant="outline"
                className="border-gray-200"
                onClick={handleChat}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#f0f0f0]">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[#4CAF50]">
                <MessageCircle className="h-4 w-4" />
                <span className="font-bold">
                  {currentShop.metrics?.responseRate || 0}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Tỉ lệ phản hồi</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[#2196F3]">
                <Clock className="h-4 w-4" />
                <span className="font-bold">Trong vài phút</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Thời gian phản hồi</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[#FF9800]">
                <Truck className="h-4 w-4" />
                <span className="font-bold">
                  {currentShop.metrics?.shippingOnTime || 0}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Giao đúng hạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Categories Sidebar */}
          <div className="lg:w-[200px] shrink-0">
            <div className="bg-white rounded border border-[#f0f0f0] p-3 lg:sticky lg:top-24">
              <h3 className="font-medium text-gray-800 mb-2">Danh mục Shop</h3>
              {categoriesLoading ? (
                <div className="flex justify-center py-4">
                  <SpinnerLoading size={20} />
                </div>
              ) : (
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveCategory("all")}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                        activeCategory === "all"
                          ? "bg-[#FFEBEE] text-[#E53935]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Tất cả
                      <span className="text-gray-400 ml-1">
                        ({totalProducts})
                      </span>
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat._id}>
                      <button
                        onClick={() => setActiveCategory(cat._id)}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                          activeCategory === cat._id
                            ? "bg-[#FFEBEE] text-[#E53935]"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {cat.name}
                        <span className="text-gray-400 ml-1">
                          ({cat.productCount})
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Search & Filter Bar */}
            <div className="bg-white rounded border border-[#f0f0f0] p-3 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 w-full sm:max-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm trong shop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 border-gray-200 focus:border-[#E53935]"
                />
              </div>
              <div className="flex items-center gap-1 sm:ml-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-[#FFEBEE] text-[#E53935]"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list"
                      ? "bg-[#FFEBEE] text-[#E53935]"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Products */}
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <SpinnerLoading size={32} />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Không tìm thấy sản phẩm nào
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
            )}

            {/* Load More Trigger & Spinner */}
            <div
              ref={loadMoreRef}
              className="flex justify-center items-center py-8 mt-4"
            >
              {isFetchingNextPage && (
                <div className="flex flex-col items-center gap-2">
                  <SpinnerLoading noWrapper size={32} className="text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Đang tải thêm sản phẩm...
                  </span>
                </div>
              )}
              {!hasNextPage && allProducts.length > 0 && !productsLoading && (
                <p className="text-sm text-muted-foreground">
                  Đã hiển thị tất cả {allProducts.length} sản phẩm
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
