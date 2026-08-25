'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Home,
  Truck,
  ShieldCheck,
  Clock,
  Ticket,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useProducts, usePlatformVouchers } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type SortOption = 'popular' | 'newest' | 'price-asc' | 'price-desc';

const FREE_SHIPPING_BENEFITS = [
  {
    icon: Truck,
    title: 'Freeship từ 500.000₫',
    description: 'Tự động áp dụng giảm phí vận chuyển tối đa 30.000₫ cho đơn từ 500k',
  },
  {
    icon: Clock,
    title: 'Giao nhanh 2 - 4 ngày',
    description: 'Kết nối mạng lưới vận chuyển toàn quốc, cập nhật hành trình liên tục',
  },
  {
    icon: ShieldCheck,
    title: 'Đồng kiểm khi nhận',
    description: 'Kiểm tra ngoại quan sản phẩm trước khi thanh toán cho shipper',
  },
];

export default function FreeShippingPage() {
  const { data: productsData, isLoading: productsLoading, error } = useProducts({ limit: 40 });
  const { data: vouchers = [] } = usePlatformVouchers();
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const products = useMemo(() => productsData?.products || [], [productsData?.products]);

  // Filter shipping-related vouchers
  const shippingVouchers = useMemo(() => {
    return vouchers.filter(
      (v) =>
        v.type === 'percentage' ||
        v.name.toLowerCase().includes('ship') ||
        v.name.toLowerCase().includes('vận chuyển'),
    );
  }, [vouchers]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...products];
    return list.sort((a, b) => {
      const priceA = a.price?.discountPrice || a.price?.currentPrice || 0;
      const priceB = b.price?.discountPrice || b.price?.currentPrice || 0;

      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'popular':
        default:
          return (b.soldCount || 0) - (a.soldCount || 0);
      }
    });
  }, [products, sortBy]);

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
              <BreadcrumbPage>Miễn phí vận chuyển</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Truck className="h-3.5 w-3.5" />
              <span>Chương trình ưu đãi giao hàng</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              Miễn phí vận chuyển
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Mua sắm thả ga không lo về phí vận chuyển trên toàn hệ thống Aura Commerce
            </p>
          </div>
          <Link href="/vouchers">
            <Button variant="outline" size="sm" className="rounded-lg border-primary/30 text-primary hover:bg-primary/10">
              <Ticket className="mr-1.5 h-3.5 w-3.5" />
              Ví Voucher của bạn
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </header>

        {/* Benefit Highlight Cards */}
        <section className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-3">
          {FREE_SHIPPING_BENEFITS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Shipping Vouchers section if available */}
        {shippingVouchers.length > 0 && (
          <section className="mb-6 rounded-xl border border-primary/20 bg-primary-light/40 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Mã miễn phí vận chuyển</h2>
              </div>
              <Link href="/vouchers" className="text-xs font-medium text-primary hover:text-primary-hover">
                Xem tất cả mã →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shippingVouchers.slice(0, 3).map((v) => (
                <div
                  key={v._id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{v.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Đơn tối thiểu {v.minOrderValue.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <span className="rounded bg-primary-bg px-2 py-1 font-mono text-xs font-semibold text-primary">
                    {v.code}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Catalog Section Header & Sorting */}
        <section className="flex flex-col gap-3 border-y border-border py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-foreground">Sản phẩm áp dụng Freeship</h2>
          <div className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="popular">Bán chạy nhất</option>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </section>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="flex min-h-72 items-center justify-center py-16">
            <SpinnerLoading />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.
          </div>
        ) : (
          <section className="py-5">
            <ProductGrid products={sortedProducts} />
          </section>
        )}
      </div>
    </main>
  );
}
