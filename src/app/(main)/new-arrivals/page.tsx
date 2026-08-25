'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Home, Sparkles, SlidersHorizontal, Package } from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useNewArrivals } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export default function NewArrivalsPage() {
  const { data: newArrivals = [], isLoading, error } = useNewArrivals();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract unique categories from new arrival products
  const availableCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string }>();
    newArrivals.forEach((product) => {
      const cat = product.category;
      if (cat && typeof cat === 'object' && '_id' in cat && !map.has(cat._id)) {
        map.set(cat._id, { id: cat._id, name: cat.name, slug: cat.slug });
      }
    });
    return Array.from(map.values());
  }, [newArrivals]);

  // Filter and sort products
  const sortedProducts = useMemo(() => {
    let result = [...newArrivals];

    if (selectedCategory !== 'all') {
      result = result.filter((product) => {
        const cat = product.category;
        return typeof cat === 'object' ? cat?._id === selectedCategory : cat === selectedCategory;
      });
    }

    return result.sort((a, b) => {
      const priceA = a.price?.discountPrice || a.price?.currentPrice || 0;
      const priceB = b.price?.discountPrice || b.price?.currentPrice || 0;

      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [newArrivals, selectedCategory, sortBy]);

  return (
    <main className="min-h-screen bg-background py-4">
      <div className="aura-container">
        <Breadcrumb className="mb-3">
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  <span>Trang chủ</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Hàng mới về</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Bộ sưu tập mới nhất</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              Hàng mới về
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Khám phá các sản phẩm vừa được cập nhật trên Aura Commerce
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{sortedProducts.length}</span> sản phẩm
          </div>
        </header>

        {/* Category Pills & Sort Bar */}
        <section className="flex flex-col gap-3 border-b border-border py-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Filter Pills */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Tất cả ({newArrivals.length})
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-sm shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="name-asc">Tên: A đến Z</option>
            </select>
          </div>
        </section>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center py-16">
            <SpinnerLoading />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Không thể tải danh sách sản phẩm mới. Vui lòng thử lại sau.
          </div>
        ) : sortedProducts.length > 0 ? (
          <section className="py-5">
            <ProductGrid products={sortedProducts} />
          </section>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/30">
              <Package className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="text-base font-medium text-foreground">Không có sản phẩm nào</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Không tìm thấy sản phẩm mới trong danh mục đã chọn.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="mt-4 rounded-lg"
            >
              Xem tất cả sản phẩm
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
