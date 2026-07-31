'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Home, Package, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product/ProductGrid';
import { useCategoryTree } from '@/hooks/queries/useCategories';
import { useProductsByCategory } from '@/hooks/queries/useProducts';
import { getSafeErrorMessage } from '@/api';

type SortType = 'default' | 'price-asc' | 'price-desc' | 'newest';

export default function CategoryDetailPage() {
  const slug = usePathname().split('/')[2] || '';
  const { data: categories, isLoading: categoriesLoading, error } = useCategoryTree();
  const { data: products = [], isLoading: productsLoading } = useProductsByCategory(slug, {
    enabled: Boolean(slug),
  });
  const [sortBy, setSortBy] = useState<SortType>('default');
  useEffect(() => {
    if (error) toast.error(getSafeErrorMessage(error, 'Không thể tải danh mục'));
  }, [error]);
  const category = categories?.find((item) => item.slug === slug);
  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) =>
        sortBy === 'price-asc'
          ? (a.price?.currentPrice || 0) - (b.price?.currentPrice || 0)
          : sortBy === 'price-desc'
            ? (b.price?.currentPrice || 0) - (a.price?.currentPrice || 0)
            : sortBy === 'newest'
              ? new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              : 0,
      ),
    [products, sortBy],
  );
  const loading = categoriesLoading || productsLoading;
  return (
    <main className="min-h-screen bg-background py-4">
      <div className="aura-container">
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href="/" className="flex items-center gap-1 transition-colors hover:text-primary">
            <Home className="h-3 w-3" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/categories" className="transition-colors hover:text-primary">
            Danh mục
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">{category?.name || 'Sản phẩm'}</span>
        </nav>
        <header className="border-b border-border pb-3">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            {category?.name || 'Danh mục sản phẩm'}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {sortedProducts.length} sản phẩm hiện có
          </p>
        </header>
        {category?.subcategories?.length ? (
          <ul className="no-scrollbar flex gap-1 overflow-x-auto py-3">
            {category.subcategories.map((sub) => (
              <li key={sub._id} className="shrink-0">
                <Link
                  href={`/categories/${sub.slug}`}
                  className="whitespace-nowrap rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-col gap-3 border-y border-border py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortType)}
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm focus:border-primary focus:ring-primary/20 focus:outline-none"
            >
              <option value="default">Mặc định</option>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
            </select>
          </div>
          <Link href={`/products?category=${slug}`}>
            <Button variant="outline" size="sm" className="rounded-lg">
              Bộ lọc nâng cao <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <SpinnerLoading />
          </div>
        ) : sortedProducts.length ? (
          <div className="pt-5">
            <ProductGrid products={sortedProducts} />
          </div>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/30">
              <Package className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="text-sm text-muted-foreground">Danh mục này chưa có sản phẩm.</p>
          </div>
        )}
      </div>
    </main>
  );
}
