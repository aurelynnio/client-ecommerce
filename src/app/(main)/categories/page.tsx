'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ChevronRight, Package } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useCategoryTree } from '@/hooks/queries/useCategories';
import { getSafeErrorMessage } from '@/api';
import { toast } from 'sonner';

/** Directory view: hierarchy first, marketing second. */
export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategoryTree();
  useEffect(() => {
    if (error) toast.error(getSafeErrorMessage(error, 'Không thể tải danh mục'));
  }, [error]);
  return (
    <main className="min-h-screen bg-background">
      <div className="aura-container py-7 sm:py-10">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Danh mục</span>
        </nav>
        <header className="max-w-2xl border-b border-border pb-7">
          <h1 className="text-3xl font-semibold tracking-tight">Danh mục sản phẩm</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Chọn một nhóm sản phẩm để bắt đầu, sau đó lọc và sắp xếp trong danh mục đó.
          </p>
        </header>
        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <SpinnerLoading />
          </div>
        ) : categories?.length ? (
          <div className="divide-y divide-border">
            {categories.map((category) => (
              <section
                key={category._id}
                className="grid gap-4 py-7 lg:grid-cols-[15rem_minmax(0,1fr)]"
              >
                <div>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-lg font-semibold hover:text-primary"
                  >
                    {category.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {category.subcategories?.length ?? 0} danh mục con
                  </p>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
                  >
                    Xem sản phẩm <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {category.subcategories?.slice(0, 12).map((sub) => (
                    <Link
                      key={sub._id}
                      href={`/categories/${sub.slug}`}
                      className="rounded-lg border border-transparent px-3 py-2 text-sm text-muted-foreground hover:border-border hover:bg-card hover:text-primary"
                    >
                      {sub.name}
                    </Link>
                  ))}
                  {(category.subcategories?.length ?? 0) > 12 && (
                    <Link
                      href={`/categories/${category.slug}`}
                      className="px-3 py-2 text-sm font-medium text-primary"
                    >
                      Xem thêm
                    </Link>
                  )}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <Package className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Chưa có danh mục để hiển thị.</p>
          </div>
        )}
      </div>
    </main>
  );
}
