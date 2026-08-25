'use client';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
  Home,
} from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductCard from '@/components/product/ProductCard';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useShopBySlug, useShopCategories } from '@/hooks/queries/useShop';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useInfiniteShopProducts } from '@/hooks/queries/useProducts';
import { useStartConversation } from '@/hooks/queries';
import { setChatOpen } from '@/features/chat/chatSlice';
import { getSafeErrorMessage } from '@/api';

export default function ShopPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const slug = params.slug as string;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: currentShop, isLoading: shopLoading, error: shopError } = useShopBySlug(slug);
  const { data: categoriesData, isLoading: categoriesLoading } = useShopCategories(
    currentShop?._id || '',
    { enabled: !!currentShop?._id },
  );

  const categories = categoriesData?.categories || [];
  const totalProducts = categoriesData?.totalProducts || 0;

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Use infinite scroll for products with server-side filtering
  const {
    data: productsData,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteShopProducts(currentShop?._id || '', {
    limit: 24,
    shopCategory: activeCategory === 'all' ? undefined : activeCategory,
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
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Đã bỏ theo dõi shop' : 'Đã theo dõi shop');
  };

  const handleChat = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để chat với shop');
      return;
    }
    if (!currentShop?._id) return;

    try {
      await startConversationMutation.mutateAsync({ shopId: currentShop._id });
      dispatch(setChatOpen(true));
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể bắt đầu cuộc trò chuyện'));
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
      product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allProducts, searchQuery]);

  if (shopLoading) {
    return (
      <div className="min-h-screen bg-background py-4">
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
                <BreadcrumbPage>Shop</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <SpinnerLoading className="py-20" />
        </div>
      </div>
    );
  }

  if (shopError || !currentShop) {
    return (
      <div className="min-h-screen bg-background py-4">
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
                <BreadcrumbPage>Shop</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/30">
              <Store className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="text-sm text-muted-foreground">
              {shopError instanceof Error ? shopError.message : shopError || 'Không tìm thấy shop'}
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-4 rounded-lg">
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-4">
      <div className="aura-container space-y-4">
        <Breadcrumb>
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
              <BreadcrumbPage>{currentShop.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="relative h-32 md:h-48">
            <Image
              src={currentShop.banner || '/images/default-banner.svg'}
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:gap-6">
              {/* Logo */}
              <div className="relative mx-auto size-20 shrink-0 overflow-hidden rounded-full border-2 border-card md:mx-0 md:size-24">
                <Image
                  src={currentShop.logo || '/images/placeholder-shop.svg'}
                  alt={currentShop.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-3">
                  <h1 className="text-xl font-semibold text-foreground">{currentShop.name}</h1>
                  <span className="inline-flex w-fit items-center justify-center gap-1 rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <Store className="h-3 w-3" />
                    Official Store
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {currentShop.description}
                </p>

                {/* Stats */}
                <div className="mt-3 flex items-center justify-center gap-6 text-sm md:justify-start">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-star text-star" />
                    <span className="font-medium">{currentShop.rating}</span>
                    <span className="text-muted-foreground">
                      ({formatNumber(currentShop.metrics?.ratingCount || 0)} đánh giá)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {formatNumber(currentShop.followerCount || 0)}
                    </span>
                    <span className="text-muted-foreground">theo dõi</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center justify-center gap-2 md:justify-end">
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? 'outline' : 'default'}
                  className={
                    isFollowing
                      ? 'rounded-lg text-primary hover:bg-primary/10'
                      : 'rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover'
                  }
                >
                  {isFollowing ? 'Đang theo dõi' : '+ Theo dõi'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleChat}
                  className="rounded-lg"
                >
                  <MessageCircle className="mr-1 h-4 w-4" />
                  Chat
                </Button>
              </div>
            </div>

            {/* Metrics (Tmall/JD card style) */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 sm:gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-success">
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-bold">{currentShop.metrics?.responseRate || 0}%</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Tỉ lệ phản hồi</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-info">
                  <Clock className="h-4 w-4" />
                  <span className="font-bold">Trong vài phút</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Thời gian phản hồi</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-warning">
                  <Truck className="h-4 w-4" />
                  <span className="font-bold">{currentShop.metrics?.shippingOnTime || 0}%</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Giao đúng hạn</p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Sản phẩm từ {currentShop.name}
            </h2>
            {categoriesLoading ? (
              <div className="flex justify-center py-4">
                <SpinnerLoading size={20} />
              </div>
            ) : (
              <ul className="no-scrollbar flex gap-1 overflow-x-auto">
                <li className="shrink-0">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`relative whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
                      activeCategory === 'all'
                        ? 'font-bold text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    aria-current={activeCategory === 'all' ? 'page' : undefined}
                  >
                    Tất cả
                    <span className="ml-1 font-normal text-muted-foreground/60">({totalProducts})</span>
                    {activeCategory === 'all' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat._id} className="shrink-0">
                    <button
                      onClick={() => setActiveCategory(cat._id)}
                      className={`relative whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
                        activeCategory === cat._id
                          ? 'font-bold text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      aria-current={activeCategory === cat._id ? 'page' : undefined}
                    >
                      {cat.name}
                      <span className="ml-1 font-normal text-muted-foreground/60">
                        ({cat.productCount})
                      </span>
                      {activeCategory === cat._id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Search & Filter Bar */}
          <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full flex-1 sm:max-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm trong shop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-lg border-border pl-9 focus:border-primary focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 sm:ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Hiển thị dạng lưới"
                aria-pressed={viewMode === 'grid'}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="Hiển thị dạng danh sách"
                aria-pressed={viewMode === 'list'}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
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
            <div className="py-12 text-center text-muted-foreground">
              Không tìm thấy sản phẩm nào
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'
                  : 'grid grid-cols-1 gap-4 sm:grid-cols-2'
              }
            >
              {filteredProducts.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          )}

          {/* Load More Trigger & Spinner */}
          <div ref={loadMoreRef} className="flex justify-center items-center py-8 mt-4">
            {isFetchingNextPage && (
              <div className="flex flex-col items-center gap-2">
                <SpinnerLoading noWrapper size={32} className="text-primary" />
                <span className="text-sm text-muted-foreground">Đang tải thêm sản phẩm...</span>
              </div>
            )}
            {!hasNextPage && allProducts.length > 0 && !productsLoading && (
              <p className="text-sm text-muted-foreground">
                Đã hiển thị tất cả {allProducts.length} sản phẩm
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
