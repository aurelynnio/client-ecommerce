'use client';
import { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Store,
  Trash2,
  Tag,
  ChevronRight,
  Home,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
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

const FREE_SHIPPING_THRESHOLD = 500000;

// Step indicator (Tmall/JD checkout flow: Cart > Checkout > Done)
function CheckoutSteps() {
  const steps = [
    { id: 1, label: 'Giỏ hàng', icon: ShoppingCart, active: true },
    { id: 2, label: 'Thanh toán', icon: CreditCard, active: false },
    { id: 3, label: 'Hoàn thành', icon: CheckCircle2, active: false },
  ];
  return (
    <div className="hidden items-center gap-2 md:flex">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={
                step.active
                  ? 'flex items-center gap-1.5 text-primary'
                  : 'flex items-center gap-1.5 text-muted-foreground/50'
              }
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
      <div className="min-h-[70vh] bg-background py-4">
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
                <BreadcrumbPage>Giỏ hàng</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md space-y-4 pt-12 text-center"
          >
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-muted/30">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/60" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Giỏ hàng trống</h2>
              <p className="text-sm text-muted-foreground">
                Hãy thêm sản phẩm vào giỏ hàng của bạn
              </p>
            </div>

            <Link href="/products" className="block pt-4">
              <Button className="h-11 rounded-lg bg-primary px-8 text-sm font-medium hover:bg-primary-hover">
                Mua sắm ngay <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

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
              <BreadcrumbPage>Giỏ hàng</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header with title + checkout steps */}
        <div className="mb-4 flex items-end justify-between border-b border-border pb-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              Giỏ hàng
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {cartData?.items?.length || 0}
              </span>{' '}
              sản phẩm trong giỏ
            </p>
          </div>
          <CheckoutSteps />
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Cart Items */}
          <div className="min-w-0 space-y-4 lg:col-span-8">
            {isLoading && <SpinnerLoading className="py-20" />}

            {/* Table Header (desktop only, Tmall/JD style) */}
            {hasCartItems && (
              <div className="hidden border border-border bg-muted/40 rounded-t-lg px-4 py-3 text-xs font-medium text-muted-foreground lg:grid lg:grid-cols-[3rem_1fr_8rem_8rem_8rem_5rem] lg:items-center lg:gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={() => (isAllSelected ? handleUnselectAll() : handleSelectAll())}
                  className="h-4 w-4 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  aria-label="Chọn tất cả"
                />
                <span>Sản phẩm</span>
                <span className="text-center">Đơn giá</span>
                <span className="text-center">Số lượng</span>
                <span className="text-right">Số tiền</span>
                <span className="text-center">Thao tác</span>
              </div>
            )}

            {/* Mobile Select All bar */}
            {hasCartItems && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm lg:hidden">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={() => (isAllSelected ? handleUnselectAll() : handleSelectAll())}
                  className="h-4 w-4 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  aria-label="Chọn tất cả"
                />
                <span className="text-muted-foreground">
                  Chọn tất cả ({cartData?.items?.length || 0})
                </span>
                <button
                  onClick={() => {
                    void handleClearCart();
                  }}
                  className="ml-auto flex items-center gap-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-xs">Xóa tất cả</span>
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
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  {/* Shop Header */}
                  <div className="flex items-center gap-3 border-b border-border bg-muted/30 p-3">
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
                      aria-label={`Chọn tất cả từ ${shopGroup.shop.name}`}
                    />
                    <Store className="h-4 w-4 text-primary" />
                    <Link
                      href={`/shop/${shopGroup.shop.slug}`}
                      className="font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {shopGroup.shop.name}
                    </Link>
                    <span className="rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      Chính hãng
                    </span>
                  </div>

                  {/* Shop Items */}
                  {shopGroup.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-wrap items-center gap-3 border-b border-border p-3 transition-colors last:border-0 hover:bg-muted/20 sm:flex-nowrap sm:p-4"
                    >
                      {/* Checkbox */}
                      <Checkbox
                        checked={item.selected || false}
                        onCheckedChange={() => handleToggleSelect(item._id)}
                        className="h-4 w-4 shrink-0 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        aria-label={`Chọn ${typeof item.productId === 'object' && item.productId ? item.productId.name : 'sản phẩm'}`}
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
                        <div className="relative h-16 w-16 overflow-hidden rounded border border-border bg-muted sm:h-20 sm:w-20">
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
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground/60">
                              Không có ảnh
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                        <Link
                          href={`/products/${
                            typeof item.productId === 'object' && item.productId
                              ? item.productId.slug || item.productId._id
                              : item.productId || ''
                          }`}
                          className="transition-colors hover:text-primary"
                        >
                          <h3 className="mb-1 line-clamp-2 text-sm text-foreground">
                            {typeof item.productId === 'object' && item.productId
                              ? item.productId.name
                              : 'Sản phẩm'}
                          </h3>
                        </Link>

                        {/* Variation Info */}
                        {getVariationText(item) && (
                          <div className="mb-1 inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {getVariationText(item)}
                          </div>
                        )}

                        {/* Price (mobile + sm) */}
                        <div className="flex items-baseline gap-2 lg:hidden">
                          <span className="font-bold text-primary">
                            {formatCurrency(getEffectivePrice(item))}
                          </span>
                          {hasDiscount(item) && (
                            <span className="text-xs text-price-strikethrough line-through">
                              {formatCurrency(getOriginalPrice(item))}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Đơn giá (desktop only) */}
                      <div className="hidden w-32 shrink-0 text-center lg:block">
                        <span className="font-bold text-primary">
                          {formatCurrency(getEffectivePrice(item))}
                        </span>
                        {hasDiscount(item) && (
                          <span className="block text-xs text-price-strikethrough line-through">
                            {formatCurrency(getOriginalPrice(item))}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-center lg:w-32">
                        <div className="flex shrink-0 items-center">
                          <button
                            onClick={() => void updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded-l border border-border text-muted-foreground hover:bg-muted/40 disabled:opacity-50"
                            aria-label="Giảm số lượng"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="text"
                            value={item.quantity}
                            readOnly
                            className="h-7 w-10 border border-x border-border bg-background text-center text-sm text-foreground focus:outline-none"
                            aria-label="Số lượng"
                          />
                          <button
                            onClick={() => void updateQuantity(item._id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-r border border-border text-muted-foreground hover:bg-muted/40"
                            aria-label="Tăng số lượng"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Số tiền (desktop only) */}
                      <div className="hidden w-32 shrink-0 text-right lg:block">
                        <span className="font-bold text-primary">
                          {formatCurrency(getEffectivePrice(item) * item.quantity)}
                        </span>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => {
                          void handleRemoveItem(item._id);
                        }}
                        className="flex shrink-0 items-center justify-center text-muted-foreground hover:text-destructive lg:w-20"
                        aria-label="Xóa sản phẩm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="min-w-0 lg:col-span-4">
            <div className="rounded-lg border border-border bg-card p-4 lg:sticky lg:top-[124px]">
              <h2 className="mb-3 border-b border-border pb-3 text-base font-bold text-foreground">
                Thông tin đơn hàng
              </h2>

              {/* Freeship Progress Bar (Tmall/JD style) */}
              {(() => {
                const baseTotal = hasSelectedItems ? checkoutTotal || 0 : subtotal;
                const remaining = FREE_SHIPPING_THRESHOLD - baseTotal;
                const reached = baseTotal >= FREE_SHIPPING_THRESHOLD;
                const percent = Math.min(
                  100,
                  Math.round((baseTotal / FREE_SHIPPING_THRESHOLD) * 100),
                );
                return (
                  <div
                    className={
                      reached
                        ? 'mb-3 rounded border border-success/30 bg-success/10 p-2.5 text-xs'
                        : 'mb-3 rounded border border-warning/30 bg-warning/10 p-2.5 text-xs'
                    }
                  >
                    <div className="flex items-center gap-1.5">
                      <Truck className={reached ? 'h-3.5 w-3.5 text-success' : 'h-3.5 w-3.5 text-warning'} />
                      {reached ? (
                        <span className="font-medium text-success">
                          Bạn được miễn phí vận chuyển
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Mua thêm{' '}
                          <span className="font-semibold text-warning">
                            {formatCurrency(remaining)}
                          </span>{' '}
                          để được freeship
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={
                          reached
                            ? 'h-full rounded-full bg-success transition-[width]'
                            : 'h-full rounded-full bg-warning transition-[width]'
                        }
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Promo Code */}
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Mã giảm giá</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập mã giảm giá"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={!!appliedPlatformVoucher}
                    className="h-9 rounded-lg border-border text-sm focus:border-primary focus:ring-primary/20"
                  />
                  {appliedPlatformVoucher ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemoveVoucher}
                      className="h-9 border-destructive/30 px-3 text-destructive hover:bg-destructive/15"
                    >
                      Xóa
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleApplyVoucher}
                      disabled={voucherLoading || !promoCode}
                      className="h-9 rounded-lg bg-primary px-4 hover:bg-primary-hover"
                    >
                      Áp dụng
                    </Button>
                  )}
                </div>
                {appliedPlatformVoucher && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-success">
                    <span>✓</span>
                    <span>Đã áp dụng mã: {appliedPlatformVoucher.code}</span>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-2.5 border-t border-border py-3">
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
              <div className="flex items-center justify-between border-t border-border py-3">
                <span className="font-medium text-foreground">Tổng cộng</span>
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
                className="h-11 w-full rounded-lg bg-primary text-base font-medium hover:bg-primary-hover"
                onClick={handleCheckout}
                disabled={!hasSelectedItems}
              >
                {hasSelectedItems ? `Mua hàng (${selectedItemsCount})` : 'Chọn sản phẩm để mua'}
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Miễn phí vận chuyển cho đơn hàng từ {formatCurrency(FREE_SHIPPING_THRESHOLD)}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-12">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-2">
            <span className="inline-block h-5 w-1 rounded-full bg-primary" />
            <h2 className="text-lg font-semibold text-foreground">Có thể bạn cũng thích</h2>
          </div>
          <ForYouSection className="px-0" />
        </div>
      </div>

      {/* Sticky Mobile Checkout Bar (Tmall/JD style) */}
      {hasSelectedItems && (
        <div className="sticky bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Tổng cộng</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(
                appliedPlatformVoucher
                  ? (checkoutTotal || 0) - appliedPlatformVoucher.discountAmount
                  : checkoutTotal || 0,
              )}
            </p>
          </div>
          <Button
            className="h-11 shrink-0 rounded-lg bg-primary px-8 font-medium hover:bg-primary-hover"
            onClick={handleCheckout}
          >
            Mua hàng ({selectedItemsCount})
          </Button>
        </div>
      )}
    </div>
  );
}
