// ProductsPage - Taobao Style with Sticky Category Tabs
"use client";

import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useProducts } from "@/hooks/queries/useProducts";
import { useActiveCategories } from "@/hooks/queries/useCategories";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronDown, Sparkles, LayoutGrid } from "lucide-react";
import ProductFilter from "@/components/product/ProductFilter";
import ProductGrid from "@/components/product/ProductGrid";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { ProductFilters, ProductUrlFilters } from "@/types/product";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const DEFAULT_FILTERS: ProductUrlFilters = {
  search: "",
  minPrice: 0,
  maxPrice: 10000000,
  rating: "",
  colors: "",
  sizes: "",
  sortBy: "newest",
  category: "",
};

// Sort tabs for Taobao style
const SORT_TABS = [
  { label: "Phổ biến", value: "popular" },
  { label: "Mới nhất", value: "newest" },
  { label: "Bán chạy", value: "best_selling" },
  { label: "Giá", value: "price", hasDropdown: true },
];

const DEFAULT_MAX_PRICE = 10000000;

const formatCompactPrice = (value: number) =>
  value.toLocaleString("vi-VN", {
    maximumFractionDigits: 0,
  });

export default function ProductsPage() {
  const {
    filters: urlFilters,
    updateFilters,
    resetFilters,
  } = useUrlFilters<ProductUrlFilters>({
    defaultFilters: DEFAULT_FILTERS,
    basePath: "/products",
  });

  const { data: categoriesData } = useActiveCategories({});
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [productLimit, setProductLimit] = useState(50);
  const activeCategory = (urlFilters.category as string) || null;

  const filters: ProductFilters = useMemo(
    () => ({
      search: urlFilters.search as string,
      minPrice: Number(urlFilters.minPrice),
      maxPrice: Number(urlFilters.maxPrice),
      rating:
        (urlFilters.rating as string)
          ?.split(",")
          .map(Number)
          .filter((n) => n > 0) || [],
      colors: (urlFilters.colors as string)?.split(",").filter(Boolean) || [],
      sizes: (urlFilters.sizes as string)?.split(",").filter(Boolean) || [],
      sortBy: urlFilters.sortBy as string,
    }),
    [urlFilters]
  );

  const activeCategoryName = useMemo(() => {
    if (!activeCategory) return "Tất cả danh mục";
    return categories.find((category) => category._id === activeCategory)?.name || "Danh mục đã chọn";
  }, [activeCategory, categories]);

  const priceSort =
    filters.sortBy === "price_desc"
      ? "desc"
      : filters.sortBy === "price_asc"
        ? "asc"
        : null;

  // Debounced filters using custom hook
  const debouncedFilters = useDebounce(filters, 300);
  const debouncedCategory = useDebounce(activeCategory, 300);


  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {
      page: 1,
      limit: productLimit,
    };

    if (debouncedFilters.search) params.search = debouncedFilters.search;
    if (debouncedFilters.minPrice > 0)
      params.minPrice = debouncedFilters.minPrice;
    if (debouncedFilters.maxPrice < 10000000)
      params.maxPrice = debouncedFilters.maxPrice;
    if (debouncedFilters.sortBy !== "newest")
      params.sort = debouncedFilters.sortBy;
    if (debouncedFilters.rating.length > 0)
      params.rating = debouncedFilters.rating.join(",");
    if (debouncedFilters.colors.length > 0)
      params.colors = debouncedFilters.colors.join(",");
    if (debouncedFilters.sizes.length > 0)
      params.sizes = debouncedFilters.sizes.join(",");
    if (debouncedCategory) params.category = debouncedCategory;

    return params;
  }, [debouncedFilters, debouncedCategory, productLimit]);

  const { data: productsData, isLoading } = useProducts(queryParams);
  const products = useMemo(() => productsData?.products || [], [productsData?.products]);
  const totalProducts = productsData?.pagination?.total || products.length;
  const activeFiltersCount = useMemo(() => {
    return (
      (filters.search ? 1 : 0) +
      filters.rating.length +
      filters.colors.length +
      filters.sizes.length +
      (filters.minPrice > 0 || filters.maxPrice < DEFAULT_MAX_PRICE ? 1 : 0) +
      (activeCategory ? 1 : 0)
    );
  }, [activeCategory, filters]);

  const appliedFilterLabels = useMemo(() => {
    const labels: string[] = [];

    if (activeCategory) labels.push(activeCategoryName);
    if (filters.search) labels.push(`Từ khóa: ${filters.search}`);
    if (filters.minPrice > 0 || filters.maxPrice < DEFAULT_MAX_PRICE) {
      labels.push(
        `Giá: ${formatCompactPrice(filters.minPrice)}đ - ${formatCompactPrice(filters.maxPrice)}đ`,
      );
    }
    if (filters.colors.length > 0) labels.push(`${filters.colors.length} màu`);
    if (filters.sizes.length > 0) labels.push(`${filters.sizes.length} kích thước`);
    if (filters.rating.length > 0) labels.push(`${filters.rating.length} mức đánh giá`);

    return labels;
  }, [activeCategory, activeCategoryName, filters]);

  const availableColors = useMemo(
    () =>
      Array.from(
        new Set(
          products.flatMap((product) =>
            (product.variants || [])
              .map((variant) => variant.color?.trim())
              .filter((color): color is string => Boolean(color)),
          ),
        ),
      ).slice(0, 20),
    [products],
  );

  const availableSizes = useMemo(
    () =>
      Array.from(
        new Set(
          products.flatMap((product) =>
            (product.sizes || []).map((size) => size.trim()),
          ),
        ),
      )
        .filter((size): size is string => Boolean(size))
        .slice(0, 20),
    [products],
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      const updates: Partial<ProductUrlFilters> = {};

      if (newFilters.search !== undefined) updates.search = newFilters.search;
      if (newFilters.minPrice !== undefined)
        updates.minPrice = newFilters.minPrice;
      if (newFilters.maxPrice !== undefined)
        updates.maxPrice = newFilters.maxPrice;
      if (newFilters.rating !== undefined)
        updates.rating = newFilters.rating.join(",");
      if (newFilters.colors !== undefined)
        updates.colors = newFilters.colors.join(",");
      if (newFilters.sizes !== undefined)
        updates.sizes = newFilters.sizes.join(",");
      if (newFilters.sortBy !== undefined) updates.sortBy = newFilters.sortBy;

      updateFilters(updates);
      setProductLimit(50);
    },
    [updateFilters, setProductLimit]
  );

  const handleClearFilters = useCallback(() => {
    resetFilters();
    setProductLimit(50);
  }, [resetFilters, setProductLimit]);

  const handleSortTabClick = (value: string) => {
    if (value === "price") {
      const newSort = priceSort === "asc" ? "desc" : "asc";
      handleFilterChange({ sortBy: `price_${newSort}` });
    } else {
      handleFilterChange({ sortBy: value });
    }
    setProductLimit(50);
  };

  const handleCategoryClick = (categoryId: string | null | undefined) => {
    updateFilters({ category: categoryId ?? "" });
    setProductLimit(50);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf6]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-6">
        <section className="overflow-hidden rounded-[32px] border border-[#efe6db] bg-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.3)]">
          <div className="grid gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:px-8 lg:py-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f3d7d1] bg-[#fff5f3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#E53935]">
                <Sparkles className="h-3.5 w-3.5" />
                Danh mục sản phẩm
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">
                  Khám phá sản phẩm theo cách gọn hơn, dễ lọc hơn và đỡ rối hơn.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-500 lg:text-base">
                  Toàn bộ danh mục, bộ lọc và sắp xếp được gom lại thành một nhịp đọc rõ ràng hơn để người dùng tìm đúng món nhanh hơn.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] border border-[#f0e4d6] bg-[#faf6f0] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Kết quả hiện có
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {totalProducts}
                </p>
                <p className="mt-1 text-sm text-slate-500">sản phẩm trong danh sách</p>
              </div>
              <div className="rounded-[24px] border border-[#f0e4d6] bg-[#faf6f0] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Bộ lọc đang dùng
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {activeFiltersCount}
                </p>
                <p className="mt-1 text-sm text-slate-500">{activeCategoryName}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-[#efe6db] bg-white px-4 py-4 shadow-[0_20px_60px_-52px_rgba(15,23,42,0.35)] lg:px-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Duyệt nhanh theo danh mục
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Chọn một nhóm hàng trước, sau đó tinh chỉnh bằng bộ lọc bên trái.
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-[#faf6f0] px-3 py-2 text-xs font-medium text-slate-500 lg:flex">
              <LayoutGrid className="h-3.5 w-3.5" />
              {categories.length} danh mục
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !activeCategory
                  ? "bg-[#E53935] text-white shadow-[0_12px_24px_-18px_rgba(229,57,53,0.9)]"
                  : "bg-[#faf6f0] text-slate-600 hover:bg-[#f4ede4]"
              }`}
            >
              Tất cả
            </button>
            {categories?.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category._id
                    ? "bg-[#E53935] text-white shadow-[0_12px_24px_-18px_rgba(229,57,53,0.9)]"
                    : "bg-[#faf6f0] text-slate-600 hover:bg-[#f4ede4]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="sticky top-[91px] z-40 border-y border-[#efe6db] bg-[#fcfaf6]/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1440px] px-4 py-3 lg:px-6">
          <div className="rounded-[24px] border border-[#efe6db] bg-white px-4 py-4 shadow-[0_16px_50px_-44px_rgba(15,23,42,0.35)] lg:px-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-950">{totalProducts}</span>
                  <span className="text-slate-500">sản phẩm</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{activeCategoryName}</span>
                  {activeFiltersCount > 0 ? (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="rounded-full bg-[#fff1ee] px-2.5 py-1 text-xs font-medium text-[#E53935]">
                        {activeFiltersCount} bộ lọc đang áp dụng
                      </span>
                    </>
                  ) : null}
                </div>
                {appliedFilterLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {appliedFilterLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-[#f0e4d6] bg-[#faf6f0] px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {label}
                      </span>
                    ))}
                    <button
                      onClick={handleClearFilters}
                      className="rounded-full border border-transparent px-1 text-xs font-medium text-[#E53935] transition-colors hover:text-[#D32F2F]"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Chưa áp dụng bộ lọc nào. Bạn có thể bắt đầu từ danh mục, giá hoặc màu sắc.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {SORT_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => handleSortTabClick(tab.value)}
                      className={`flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        filters.sortBy === tab.value ||
                        (tab.value === "price" && filters.sortBy?.startsWith("price"))
                          ? "bg-[#E53935] text-white shadow-[0_12px_24px_-18px_rgba(229,57,53,0.9)]"
                          : "bg-[#faf6f0] text-slate-600 hover:bg-[#f4ede4]"
                      }`}
                    >
                      {tab.label}
                      {tab.hasDropdown ? (
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${
                            priceSort === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      ) : null}
                    </button>
                  ))}
                </div>

                <Sheet
                  open={isMobileFilterOpen}
                  onOpenChange={setIsMobileFilterOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-[#e9ddd0] bg-white text-slate-700 hover:bg-[#faf6f0] lg:hidden"
                    >
                      <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[300px] overflow-y-auto border-r border-[#efe6db] bg-[#fcfaf6] p-0"
                  >
                    <SheetHeader className="border-b border-[#efe6db] px-5 py-4">
                      <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
                    </SheetHeader>
                    <div className="p-4">
                      <ProductFilter
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        availableColors={availableColors}
                        availableSizes={availableSizes}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-6">
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ProductFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            availableColors={availableColors}
            availableSizes={availableSizes}
          />

          <div className="flex-1 min-h-[500px] relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[28px] bg-white/70 backdrop-blur-sm">
                <SpinnerLoading />
              </div>
            )}

            <div className="rounded-[28px] border border-[#efe6db] bg-white p-4 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.35)] sm:p-5">
              <ProductGrid
                products={products || []}
                isLoading={isLoading && !products?.length}
              />
            </div>

            {products.length > 0 && products.length < totalProducts && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  className="h-11 rounded-full border-[#E53935]/25 bg-white px-8 text-[#E53935] hover:bg-[#fff5f3]"
                  onClick={() => setProductLimit((prev) => prev + 50)}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang tải..." : "Xem thêm sản phẩm"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
