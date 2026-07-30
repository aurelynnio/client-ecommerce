'use client';
import { useEffect, useState, useMemo } from 'react';
import { Plus, Minus, ShoppingBag, ArrowRight, Store, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {
  setCartFromQuery,
  toggleSelectItem,
  selectAllItems,
  unselectAllItems,
  prepareForCheckout,
} from '@/features/cart/cartSlice';
import { formatCurrency } from '@/utils/format';
import {
  useApplyVoucher,
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from '@/hooks/queries';
import { ApplyVoucherResult } from '@/types/voucher';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { groupCartItemsByShop, CartItem } from '@/types/cart';
import { ForYouSection } from '@/components/product/RecommendationSection';
import { getSafeErrorMessage } from '@/api';

const EMPTY_CART_ITEMS: CartItem[] = [];

export default function CartPage() {
  const { selectedItems, checkoutTotal } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartQuery = useCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();
  const [promoCode, setPromoCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<ApplyVoucherResult | null>(null);
  const applyVoucherMutation = useApplyVoucher();

  // Derive cart data from React Query (source of truth) with selection overlay from Redux.
  // This prevents the "cart redirect flash" where stale Redux state briefly showed an
  // empty cart before setCartFromQuery could sync in a useEffect.
  const cartData = useMemo(() => {
    if (!cartQuery.data) return null;
    const selectedIds = new Set((selectedItems ?? []).map((item) => item._id));
    return {
      ...cartQuery.data,
      items: (cartQuery.data.items ?? []).map((item) => ({
        ...item,
        selected: selectedIds.has(item._id),
      })),
    };
  }, [cartQuery.data, selectedItems]);

  const isLoading = cartQuery.isLoading;

  const appliedPlatformVoucher = appliedVoucher?.scope === 'platform' ? appliedVoucher : null;
  const voucherLoading = applyVoucherMutation.isPending;

  useEffect(() => {
    if (cartQuery.data) {
      dispatch(setCartFromQuery(cartQuery.data));
    }
  }, [dispatch, cartQuery.data]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const updatedCart = await updateCartItemMutation.mutateAsync({
        itemId,
        quantity: newQuantity,
      });
      dispatch(setCartFromQuery(updatedCart));
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể cập nhật giỏ hàng'));
    }
  };

  const handleClearCart = async () => {
    try {
      const clearedCart = await clearCartMutation.mutateAsync();
      dispatch(setCartFromQuery(clearedCart));
      setAppliedVoucher(null);
      toast.success('Đã xóa giỏ hàng');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể xóa giỏ hàng'));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const updatedCart = await removeFromCartMutation.mutateAsync(itemId);
      dispatch(setCartFromQuery(updatedCart));
      toast.success('Đã xóa sản phẩm');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể xóa sản phẩm'));
    }
  };

  const handleToggleSelect = (itemId: string) => {
    dispatch(toggleSelectItem(itemId));
  };

  const handleSelectAll = () => {
    dispatch(selectAllItems());
  };

  const handleUnselectAll = () => {
    dispatch(unselectAllItems());
  };

  const handleCheckout = () => {
    if (selectedItemsCount === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    dispatch(prepareForCheckout());
    router.push('/checkout');
  };

  const handleApplyVoucher = async () => {
    if (!promoCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    if (!selectedItems || selectedItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm để áp dụng mã giảm giá');
      return;
    }

    const orderTotal = checkoutTotal || 0;

    try {
      const result = await applyVoucherMutation.mutateAsync({
        code: promoCode,
        orderTotal,
      });
      setAppliedVoucher(result);
      toast.success('Áp dụng mã giảm giá thành công!');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể áp dụng mã giảm giá'));
      setAppliedVoucher(null);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setPromoCode('');
    toast.success('Đã xóa mã giảm giá');
  };

  const subtotal =
    cartData?.items?.reduce((sum, item) => {
      // Skip items with null productId (deleted products)
      if (item.productId === null) return sum;

      // Handle both number and Price object types
      let effectivePrice = 0;
      if (typeof item.price === 'number') {
        effectivePrice = item.price;
      } else if (item.price) {
        const discountPrice = item.price.discountPrice ?? 0;
        const currentPrice = item.price.currentPrice ?? 0;
        effectivePrice =
          discountPrice > 0 && discountPrice < currentPrice ? discountPrice : currentPrice;
      }

      return sum + (effectivePrice || 0) * item.quantity;
    }, 0) ?? 0;

  const selectedItemsCount = selectedItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const isAllSelected =
    cartData?.items && cartData.items.length > 0
      ? cartData.items.every((item) => item.selected)
      : false;

  const hasCartItems = cartData?.items && cartData.items.length > 0;
  const hasSelectedItems = selectedItems && selectedItems.length > 0;
  const cartItems = cartData?.items ?? EMPTY_CART_ITEMS;

  // Group cart items by shop for display (filter out items with null productId)
  const itemsByShop = useMemo(() => {
    // Filter out items where productId is null (deleted products)
    const validItems = cartItems.filter((item) => item.productId !== null);
    return groupCartItemsByShop(validItems);
  }, [cartItems]);

  // Get deleted product items (productId is null)
  const deletedItems = useMemo(() => {
    return cartItems.filter((item) => item.productId === null);
  }, [cartItems]);

  // Helper to get item image
  const getItemImage = (item: CartItem): string | null => {
    // 1. Try variant images first
    if (item.variant?.images?.[0]) return item.variant.images[0];

    // 2. Try to find variant from product.variants using variantId or modelId
    if (typeof item.productId === 'object' && item.productId?.variants) {
      const variantId = item.variantId || item.modelId;
      if (variantId) {
        const variant = item.productId.variants.find((v) => v._id === variantId);
        if (variant?.images?.[0]) return variant.images[0];
      }
      // Fallback to first variant's image
      if (item.productId.variants[0]?.images?.[0]) {
        return item.productId.variants[0].images[0];
      }
    }

    // 3. Fallback to product first variant image or description image
    if (typeof item.productId === 'object') {
      if (item.productId.variants?.[0]?.images?.[0]) {
        return item.productId.variants[0].images[0];
      }
      if (item.productId.descriptionImages?.[0]) {
        return item.productId.descriptionImages[0];
      }
    }

    return null;
  };

  // Helper to get variation display text
  const getVariationText = (item: CartItem): string | null => {
    const parts: string[] = [];

    // Get color from variant
    if (item.variant?.color) {
      parts.push(item.variant.color);
    } else if (item.variant?.name) {
      parts.push(item.variant.name);
    }

    // Get size
    if (item.size) {
      parts.push(`Size: ${item.size}`);
    }

    // Fallback removed

    return parts.length > 0 ? parts.join(', ') : null;
  };

  // Helper to get effective price
  const getEffectivePrice = (item: CartItem): number => {
    if (typeof item.price === 'number') {
      return item.price;
    }
    const discountPrice = item.price?.discountPrice ?? 0;
    const currentPrice = item.price?.currentPrice ?? 0;
    return discountPrice > 0 && discountPrice < currentPrice ? discountPrice : currentPrice;
  };

  // Helper to check if item has discount
  const hasDiscount = (item: CartItem): boolean => {
    if (typeof item.price === 'number') {
      return false;
    }
    const discountPrice = item.price?.discountPrice ?? 0;
    const currentPrice = item.price?.currentPrice ?? 0;
    return discountPrice > 0 && currentPrice > discountPrice;
  };

  // Helper to get original price
  const getOriginalPrice = (item: CartItem): number => {
    if (typeof item.price === 'number') {
      return item.price;
    }
    return item.price?.currentPrice ?? 0;
  };

  useEffect(() => {
    if (cartQuery.isError) {
      toast.error(getSafeErrorMessage(cartQuery.error, 'Lỗi khi tải giỏ hàng'));
    }
  }, [cartQuery.isError, cartQuery.error]);

  // Empty cart state
  if (!isLoading && !cartQuery.isFetching && (!cartData?.items || cartData.items.length === 0)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md space-y-4"
        >
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/60" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Giỏ hàng trống</h2>
            <p className="text-muted-foreground text-sm">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
          </div>

          <Link href="/products" className="block pt-4">
            <Button className="rounded-lg bg-primary hover:bg-primary-hover px-8 h-10 text-sm">
              Mua sắm ngay <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 -mt-4 -mx-4 px-4">
      <div className="aura-container">
        {/* Header */}
        <div className="bg-muted/40 border border-border rounded-lg mb-4 p-4">
          <h1 className="text-xl font-bold text-foreground">Giỏ hàng của bạn</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Cart Items */}
          <div className="min-w-0 space-y-4 lg:col-span-8">
            {isLoading && <SpinnerLoading className="py-20" />}

            {/* Select All Header */}
            {hasCartItems && (
              <div className="bg-muted/40 border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center text-sm">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={() => (isAllSelected ? handleUnselectAll() : handleSelectAll())}
                  className="h-4 w-4 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-muted-foreground">
                  Chọn tất cả ({cartData?.items?.length || 0} sản phẩm)
                </span>
                <button
                  onClick={() => {
                    void handleClearCart();
                  }}
                  className="sm:ml-auto text-muted-foreground hover:text-destructive flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Warning for deleted products */}
            {deletedItems.length > 0 && (
              <div className="bg-warning/15 border border-warning/30 rounded-sm p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-warning">
                    <span className="text-sm">
                      ⚠️ Có {deletedItems.length} sản phẩm không còn tồn tại và đã bị xóa khỏi hiển
                      thị.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      deletedItems.forEach((item) => {
                        void handleRemoveItem(item._id);
                      });
                    }}
                    className="text-sm text-destructive hover:text-destructive font-medium"
                  >
                    Xóa tất cả sản phẩm không hợp lệ
                  </button>
                </div>
              </div>
            )}

            {/* Items Grouped by Shop */}
            <AnimatePresence mode="popLayout">
              {itemsByShop.map((shopGroup) => (
                <motion.div
                  key={shopGroup.shop._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-muted/30 border border-border rounded-lg overflow-hidden"
                >
                  {/* Shop Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-border/60">
                    <Checkbox
                      checked={shopGroup.items.every((item) => item.selected)}
                      onCheckedChange={() => {
                        const allSelected = shopGroup.items.every((item) => item.selected);
                        shopGroup.items.forEach((item) => {
                          if (allSelected ? item.selected : !item.selected) {
                            handleToggleSelect(item._id);
                          }
                        });
                      }}
                      className="h-4 w-4 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Store className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{shopGroup.shop.name}</span>
                    <span className="text-xs text-primary border border-primary px-1.5 py-0.5 rounded-lg">
                      Chính hãng
                    </span>
                  </div>

                  {/* Shop Items */}
                  {shopGroup.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      {/* Checkbox */}
                      <Checkbox
                        checked={item.selected || false}
                        onCheckedChange={() => handleToggleSelect(item._id)}
                        className="h-4 w-4 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />

                      {/* Image */}
                      <Link
                        href={`/products/${
                          typeof item.productId === 'object' && item.productId
                            ? item.productId.slug || item.productId._id
                            : item.productId || ''
                        }`}
                        className="shrink-0"
                      >
                        <div className="relative w-20 h-20 bg-muted rounded overflow-hidden">
                          {getItemImage(item) ? (
                            <Image
                              src={getItemImage(item)!}
                              alt={
                                typeof item.productId === 'object' && item.productId
                                  ? item.productId.name
                                  : 'Sản phẩm'
                              }
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 text-xs">
                              Không có hình ảnh
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 basis-full sm:basis-auto">
                        <Link
                          href={`/products/${
                            typeof item.productId === 'object' && item.productId
                              ? item.productId.slug || item.productId._id
                              : item.productId || ''
                          }`}
                          className="hover:text-primary transition-colors"
                        >
                          <h3 className="text-sm text-foreground line-clamp-2 mb-1">
                            {typeof item.productId === 'object' && item.productId
                              ? item.productId.name
                              : 'Sản phẩm'}
                          </h3>
                        </Link>

                        {/* Variation Info */}
                        {getVariationText(item) && (
                          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg inline-block mb-1">
                            {getVariationText(item)}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-primary font-bold">
                            {formatCurrency(getEffectivePrice(item))}
                          </span>
                          {hasDiscount(item) && (
                            <span className="text-xs text-price-strikethrough line-through">
                              {formatCurrency(getOriginalPrice(item))}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                        <div className="flex items-center shrink-0">
                          <button
                            onClick={() => void updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center border border-border rounded-l-lg text-muted-foreground hover:bg-muted/40 disabled:opacity-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="text"
                            value={item.quantity}
                            readOnly
                            className="w-10 h-7 text-center text-sm border-y border-border focus:outline-none bg-background text-foreground"
                          />
                          <button
                            onClick={() => void updateQuantity(item._id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center border border-border rounded-r-lg text-muted-foreground hover:bg-muted/40"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => {
                            void handleRemoveItem(item._id);
                          }}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="min-w-0 lg:col-span-4">
            <div className="bg-muted/40 border border-border rounded-lg p-4 lg:sticky lg:top-[140px]">
              <h2 className="text-base font-bold text-foreground mb-4 pb-3 border-b border-border">
                Thông tin đơn hàng
              </h2>

              {/* Promo Code */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Mã giảm giá</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập mã giảm giá"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={!!appliedPlatformVoucher}
                    className="h-9 text-sm rounded-lg border-border focus:border-primary focus:ring-primary/20"
                  />
                  {appliedPlatformVoucher ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemoveVoucher}
                      className="h-9 px-3 text-destructive border-destructive/30 hover:bg-destructive/15"
                    >
                      Xóa
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleApplyVoucher}
                      disabled={voucherLoading || !promoCode}
                      className="h-9 px-4 bg-primary hover:bg-primary-hover rounded-lg"
                    >
                      Áp dụng
                    </Button>
                  )}
                </div>
                {appliedPlatformVoucher && (
                  <div className="mt-2 text-xs text-success flex items-center gap-1">
                    <span>✓</span>
                    <span>Đã áp dụng mã: {appliedPlatformVoucher.code}</span>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-3 py-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tạm tính ({selectedItemsCount} sản phẩm)
                  </span>
                  <span className="text-foreground">
                    {formatCurrency(hasSelectedItems ? checkoutTotal || 0 : subtotal)}
                  </span>
                </div>

                {appliedPlatformVoucher && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(appliedPlatformVoucher.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="text-foreground">Miễn phí</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4 border-t border-border">
                <span className="text-foreground font-medium">Tổng cộng</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(
                    appliedPlatformVoucher
                      ? (checkoutTotal || 0) - appliedPlatformVoucher.discountAmount
                      : hasSelectedItems
                        ? checkoutTotal || 0
                        : subtotal,
                  )}
                </span>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full h-11 bg-primary hover:bg-primary-hover rounded-lg text-base font-medium"
                onClick={handleCheckout}
                disabled={!hasSelectedItems}
              >
                {hasSelectedItems ? `Mua hàng (${selectedItemsCount})` : 'Chọn sản phẩm để mua'}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-3">
                Miễn phí vận chuyển cho đơn hàng từ ₫500.000
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-12">
          <div className="bg-muted/40 border border-border rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold text-foreground">Có thể bạn cũng thích</h2>
          </div>
          <ForYouSection className="px-0" />
        </div>
      </div>
    </div>
  );
}
