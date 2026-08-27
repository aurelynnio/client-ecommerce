'use client';
import { useCallback, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, ArrowRight, Home, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useAppSelector } from '@/hooks/redux';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/queries/useWishlist';
import { useAddToCart } from '@/hooks/queries/useCart';
import { Product } from '@/types/product';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useRouter } from 'next/navigation';
import { getSafeErrorMessage } from '@/api';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const WishlistBreadcrumb = () => (
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
        <BreadcrumbPage>Yêu thích</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

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
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } catch (error) {
        toast.error(getSafeErrorMessage(error, 'Có lỗi xảy ra'));
      }
    },
    [removeFromWishlistMutation],
  );

  const handleAddToCart = useCallback(
    async (product: Product) => {
      try {
        const shopId = typeof product.shop === 'object' ? product.shop._id : product.shop;
        await addToCartMutation.mutateAsync({
          productId: product._id,
          shopId: shopId || '',
          quantity: 1,
        });
        toast.success('Đã thêm vào giỏ hàng');
      } catch (error) {
        toast.error(getSafeErrorMessage(error, 'Không thể thêm vào giỏ hàng'));
      }
    },
    [addToCartMutation],
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/wishlist');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Loading state
  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-4">
        <div className="aura-container">
          <WishlistBreadcrumb />
          <SpinnerLoading className="py-20" />
        </div>
      </div>
    );
  }

  // Empty State
  if (!isLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-4">
        <div className="aura-container">
          <WishlistBreadcrumb />
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full border border-border bg-muted/30">
              <Heart className="h-9 w-9 text-muted-foreground/60" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Chưa có sản phẩm yêu thích
              </h2>
              <p className="text-sm text-muted-foreground">
                Hãy thêm sản phẩm vào danh sách yêu thích của bạn để theo dõi và mua sắm dễ dàng hơn
              </p>
            </div>
            <Link href="/products" className="mt-6 block">
              <Button className="h-11 rounded-lg bg-primary px-8 font-medium text-primary-foreground hover:bg-primary-hover">
                Khám phá sản phẩm
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4">
      <div className="aura-container">
        <WishlistBreadcrumb />

        {/* Page Header */}
        <div className="mb-4 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              Sản phẩm yêu thích
            </h1>
            <span className="text-sm text-muted-foreground">
              ({pagination?.totalItems || items.length} sản phẩm)
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Những sản phẩm bạn đã lưu để theo dõi và mua sắm sau
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {items.map((item) => {
            const price = item.price?.discountPrice || item.price?.currentPrice || 0;
            const originalPrice = item.price?.currentPrice || 0;
            const hasDiscount =
              item.price?.discountPrice && item.price.discountPrice < originalPrice;
            // Get image from: variants[0].images[0] -> placeholder
            const productImage =
              item.variants?.[0]?.images?.[0] || '/images/placeholder-product.svg';
            const shopName = typeof item.shop === 'object' ? item.shop?.name : 'Shop';
            const ratingAverage = item.ratingAverage || 0;
            const soldCount = item.soldCount || 0;

            return (
              <article
                key={item._id}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
              >
                {/* Image */}
                <Link href={`/products/${item.slug || item._id}`}>
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={productImage}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.02] motion-reduce:transform-none"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    {/* Remove Button (border-over-shadow rule) */}
                    <button
                      aria-label={`Xóa ${item.name} khỏi danh sách yêu thích`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveItem(item._id);
                      }}
                      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3">
                  <Link href={`/products/${item.slug || item._id}`}>
                    <h3 className="line-clamp-2 min-h-10 text-sm leading-5 text-foreground transition-colors group-hover:text-primary">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xs text-primary">₫</span>
                    <span className="text-base font-bold text-primary">
                      {price.toLocaleString('vi-VN')}
                    </span>
                    {hasDiscount && (
                      <span className="ml-1 text-xs text-price-strikethrough line-through">
                        ₫{originalPrice.toLocaleString('vi-VN')}
                      </span>
                    )}
                  </div>

                  {/* Rating + Sold (Tmall/JD style) */}
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-star text-star" />
                      <span className="font-medium text-foreground">
                        {ratingAverage.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-muted-foreground/40">|</span>
                    <span>Đã bán {soldCount}</span>
                  </div>

                  {/* Shop */}
                  <p className="mt-1 truncate text-xs text-muted-foreground">{shopName}</p>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(item)}
                    variant="outline"
                    size="sm"
                    className="mt-3 h-9 w-full rounded-lg border-primary/30 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                    Thêm vào giỏ
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
