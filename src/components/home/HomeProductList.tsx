"use client";
import { useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/hooks/hooks";
import {
  useInfiniteProducts,
  useInfiniteProductsByCategory,
} from "@/hooks/queries/useProducts";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { ProductCard } from "@/components/product/ProductCard";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { getSafeErrorMessage } from "@/api";

interface HomeProductListProps {
  selectedCategorySlug: string | null;
}

export default function HomeProductList({
  selectedCategorySlug,
}: HomeProductListProps) {
  const { isOpen: isChatOpen } = useAppSelector((state) => state.chat);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Use infinite category products when a category is selected
  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
    fetchNextPage: fetchNextCategoryPage,
    hasNextPage: hasNextCategoryPage,
    isFetchingNextPage: isFetchingNextCategoryPage,
  } = useInfiniteProductsByCategory(selectedCategorySlug || "", {
    enabled: !!selectedCategorySlug,
    limit: 20,
  });

  // Use infinite products when no category is selected
  const {
    data: infiniteData,
    isLoading: allLoading,
    error: allError,
    fetchNextPage: fetchNextAllPage,
    hasNextPage: hasNextAllPage,
    isFetchingNextPage: isFetchingNextAllPage,
  } = useInfiniteProducts({ limit: 20 });

  // Determine which data to use
  const isLoading = selectedCategorySlug ? categoryLoading : allLoading;
  const error = selectedCategorySlug ? categoryError : allError;
  const fetchNextPage = selectedCategorySlug
    ? fetchNextCategoryPage
    : fetchNextAllPage;
  const hasNextPage = selectedCategorySlug
    ? hasNextCategoryPage
    : hasNextAllPage;
  const isFetchingNextPage = selectedCategorySlug
    ? isFetchingNextCategoryPage
    : isFetchingNextAllPage;

  // Flatten infinite pages into single array
  const products = selectedCategorySlug
    ? categoryData?.pages.flatMap((page) => page.products) || []
    : infiniteData?.pages.flatMap((page) => page.products) || [];

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

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        Đã xảy ra lỗi: {getSafeErrorMessage(error, "Không thể tải sản phẩm")}
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-[300px]">
      {isLoading && <SpinnerLoading className="absolute inset-0 m-auto z-10" />}

      <div
        className={
          isLoading
            ? "opacity-50 pointer-events-none transition-opacity"
            : "opacity-100 transition-opacity"
        }
      >
        <motion.div
          key={selectedCategorySlug || "all"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "grid gap-3 transition-all duration-300",
            isChatOpen
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          )}
        >
          {products && products.length > 0
            ? products.map((p, index) => (
                <motion.div
                  key={p._id}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  layout
                >
                  <ProductCard product={p} index={index} />
                </motion.div>
              ))
            : !isLoading && (
                <div className="col-span-full text-center py-20">
                  <p className="text-muted-foreground text-lg">
                    Không tìm thấy sản phẩm nào trong danh mục này.
                  </p>
                </div>
              )}
        </motion.div>

        {/* Load More Trigger & Loading Spinner */}
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
          {!hasNextPage && products.length > 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">
              Bạn đã xem hết sản phẩm
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
