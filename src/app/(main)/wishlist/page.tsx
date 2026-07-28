'use client';
import { useCallback, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useAppSelector } from '@/hooks/hooks';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/queries/useWishlist';
import { useAddToCart } from '@/hooks/queries/useCart';
import { Product } from '@/types/product';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useRouter } from 'next/navigation';
import { getSafeErrorMessage } from '@/api';

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
      <div className="min-h-[70vh] flex items-center justify-center">
        <SpinnerLoading size={32} />
      </div>
    );
  }

  // Empty State
  if (!isLoading && items.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background p-4">
        <div className="max-w-md space-y-4 text-center">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full border border-border bg-card">
            <Heart className="h-9 w-9 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Chưa có sản phẩm yêu thích</h2>
            <p className="text-sm text-muted-foreground">
              Hãy thêm sản phẩm vào danh sách yêu thích của bạn
            </p>
          </div>
          <Link href="/products" className="block pt-4">
            <Button className="h-10 px-8 text-sm">
              Khám phá sản phẩm <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Sản phẩm yêu thích</h1>
              <span className="text-sm text-muted-foreground">
                ({pagination?.totalItems || items.length} sản phẩm)
              </span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const price = item.price?.discountPrice || item.price?.currentPrice || 0;
            const originalPrice = item.price?.currentPrice || 0;
            const hasDiscount =
              item.price?.discountPrice && item.price.discountPrice < originalPrice;
            // Get image from: variants[0].images[0] -> placeholder
            const productImage =
              item.variants?.[0]?.images?.[0] || '/images/placeholder-product.svg';
            const shopName = typeof item.shop === 'object' ? item.shop?.name : 'Shop';

            return (
              <article
                key={item._id}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/30"
              >
                {/* Image */}
                <Link href={`/products/${item.slug || item._id}`}>
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={productImage}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    {/* Remove Button */}
                    <button
                      aria-label={`Xóa ${item.name} khỏi danh sách yêu thích`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveItem(item._id);
                      }}
                      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3">
                  <Link href={`/products/${item.slug || item._id}`}>
                    <h3 className="min-h-10 text-sm leading-5 text-foreground transition-colors group-hover:text-primary">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xs text-primary">₫</span>
                    <span className="text-base font-semibold text-primary">
                      {price.toLocaleString('vi-VN')}
                    </span>
                    {hasDiscount && (
                      <span className="ml-1 text-xs text-muted-foreground line-through">
                        ₫{originalPrice.toLocaleString('vi-VN')}
                      </span>
                    )}
                  </div>

                  {/* Shop */}
                  <p className="mt-1 truncate text-xs text-muted-foreground">{shopName}</p>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(item)}
                    variant="outline"
                    size="sm"
                    className="mt-3 h-9 w-full text-xs text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1" />
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
