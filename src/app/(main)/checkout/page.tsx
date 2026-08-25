// Checkout page
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/hooks/redux';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useCreateOrder,
  useCreatePaymentUrl,
  useApplyVoucher,
  useCart,
  useClearCart,
  useProfile,
} from '@/hooks/queries';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';
import { ApplyVoucherResult } from '@/types/voucher';
import { Address } from '@/types/address';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Check,
  CreditCard,
  Truck,
  ChevronLeft,
  MapPin,
  Tag,
  Store,
  ChevronRight,
  Shield,
  Wallet,
  Home,
  ShoppingCart,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { groupCartItemsByShop } from '@/types/cart';
import { getSafeErrorMessage } from '@/api';
import SpinnerLoading from '@/components/common/SpinnerLoading';

const FREE_SHIPPING_THRESHOLD = 500000;

const getPrimaryAddress = (addresses: Address[] = []) =>
  addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;

const hasCompleteAddress = (address: Address | null) =>
  !!(
    address?.fullName?.trim() &&
    address.phone?.trim() &&
    address.address?.trim() &&
    address.city?.trim() &&
    address.district?.trim() &&
    address.ward?.trim()
  );

// Step indicator (Tmall/JD checkout flow: Cart > Checkout > Done)
function CheckoutSteps() {
  const steps = [
    { id: 1, label: 'Giỏ hàng', icon: ShoppingCart, active: false, done: true },
    { id: 2, label: 'Thanh toán', icon: CreditCard, active: true, done: false },
    { id: 3, label: 'Hoàn thành', icon: CheckCircle2, active: false, done: false },
  ];
  return (
    <div className="hidden items-center gap-2 md:flex">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const colorClass = step.active
          ? 'text-primary'
          : step.done
            ? 'text-success'
            : 'text-muted-foreground/50';
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 ${colorClass}`}>
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{step.label}</span>
              {step.done && !step.active && <Check className="h-3 w-3" />}
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

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vnpay'>('cod');
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedShopVoucher, setAppliedShopVoucher] = useState<ApplyVoucherResult | null>(null);
  const [appliedPlatformVoucher, setAppliedPlatformVoucher] = useState<ApplyVoucherResult | null>(
    null,
  );
  const [note, setNote] = useState('');

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { checkoutTotal, selectedItems } = useAppSelector((state) => state.cart);
  const router = useRouter();
  const cartQuery = useCart();
  const cartData = cartQuery.data;
  const profileQuery = useProfile({ enabled: isAuthenticated });
  const currentUser = profileQuery.data;

  const createOrderMutation = useCreateOrder();
  const clearCartMutation = useClearCart();
  const paymentMutation = useCreatePaymentUrl();
  const applyVoucherMutation = useApplyVoucher();
  const voucherLoading = applyVoucherMutation.isPending;
  const isSubmitting = createOrderMutation.isPending || paymentMutation.isPending;

  const hasSelectedItems = selectedItems.length > 0;
  const cartItems = useMemo(() => {
    return hasSelectedItems ? selectedItems : (cartData?.items ?? []);
  }, [hasSelectedItems, selectedItems, cartData]);

  // Group items by shop
  const itemsByShop = useMemo(() => {
    return groupCartItemsByShop(cartItems);
  }, [cartItems]);

  // Calculate discounts
  const shopDiscount = appliedShopVoucher?.discountAmount || 0;
  const platformDiscount = appliedPlatformVoucher?.discountAmount || 0;
  const totalDiscount = shopDiscount + platformDiscount;

  const finalTotal = (checkoutTotal || 0) - totalDiscount;
  const cartItemIds = cartItems.map((item) => item._id);
  const primaryAddress = useMemo(
    () => getPrimaryAddress(currentUser?.addresses),
    [currentUser?.addresses],
  );
  const hasValidAddress = hasCompleteAddress(primaryAddress);

  useEffect(() => {
    if (cartQuery.isLoading) {
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      router.push('/cart');
      return;
    }
  }, [cartItems, cartQuery.isLoading, router]);

  useEffect(() => {
    if (cartQuery.isLoading || profileQuery.isLoading || !cartItems.length) {
      return;
    }

    if (!hasValidAddress) {
      toast.error('Vui lòng cập nhật địa chỉ nhận hàng trong hồ sơ trước khi thanh toán', {
        id: 'checkout-address-required',
      });
      router.replace('/profile?tab=address');
    }
  }, [cartItems.length, cartQuery.isLoading, hasValidAddress, profileQuery.isLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!primaryAddress || !hasValidAddress) {
      toast.error('Địa chỉ giao hàng chưa đầy đủ');
      router.push('/profile?tab=address');
      return;
    }

    try {
      const orderData = {
        cartItemIds,
        addressId: primaryAddress._id,
        paymentMethod,
        platformVoucher: appliedPlatformVoucher?.code,
        shopVouchers: appliedShopVoucher
          ? [
              {
                shopId: itemsByShop[0]?.shop._id,
                code: appliedShopVoucher.code,
              },
            ].filter((voucher) => voucher.shopId)
          : [],
        note,
      };

      const result = await createOrderMutation.mutateAsync(orderData);

      if (result) {
        clearCartMutation.mutateAsync().catch(console.error);

        if (paymentMethod === 'vnpay') {
          try {
            toast.loading('Đang chuyển đến VNPay...');
            const orders = (result as unknown as { orders: { _id: string }[] }).orders;
            const firstOrder = orders?.[0];
            if (!firstOrder?._id) throw new Error('Missing order ID');

            const paymentResult = await paymentMutation.mutateAsync(firstOrder._id);

            if (paymentResult.paymentUrl) {
              window.location.href = paymentResult.paymentUrl;
              return;
            }
          } catch (paymentError: unknown) {
            console.error('Payment error:', paymentError);
            toast.error(
              getSafeErrorMessage(
                paymentError,
                'Không thể tạo thanh toán VNPay. Vui lòng thanh toán lại trong lịch sử đơn hàng.',
              ),
            );
            router.push('/');
          }
        } else {
          toast.success('Đặt hàng thành công!');
          router.push(`/`);
        }
      }
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Đã xảy ra lỗi'));
    }
  };

  const handleApplyVoucher = async () => {
    if (!promoCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    const orderTotal = checkoutTotal || 0;

    try {
      const result = await applyVoucherMutation.mutateAsync({
        code: promoCode,
        orderTotal,
      });
      // Set the appropriate voucher based on scope
      if (result.scope === 'shop') {
        setAppliedShopVoucher(result);
      } else {
        setAppliedPlatformVoucher(result);
      }
      toast.success('Áp dụng mã giảm giá thành công!');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể áp dụng mã giảm giá'));
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedShopVoucher(null);
    setAppliedPlatformVoucher(null);
    setPromoCode('');
    toast.success('Đã xóa mã giảm giá');
  };

  // Helper to get item image
  const getItemImage = (item: (typeof cartItems)[0]): string | null => {
    if (item.variant?.images?.[0]) return item.variant.images[0];
    if (typeof item.productId === 'object') {
      if (item.productId.variants?.[0]?.images?.[0]) return item.productId.variants[0].images[0];
      if (item.productId.descriptionImages?.[0]) return item.productId.descriptionImages[0];
    }
    return null;
  };

  // Helper to get effective price
  const getEffectivePrice = (item: (typeof cartItems)[0]): number => {
    if (typeof item.price === 'number') {
      return item.price;
    }
    const discountPrice = item.price?.discountPrice ?? 0;
    const currentPrice = item.price?.currentPrice ?? 0;
    return discountPrice > 0 && discountPrice < currentPrice ? discountPrice : currentPrice;
  };

  if (!cartItems || cartItems.length === 0) {
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
                <BreadcrumbLink asChild>
                  <Link href="/cart">Giỏ hàng</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Thanh toán</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <SpinnerLoading className="py-20" />
        </div>
      </div>
    );
  }

  if (profileQuery.isLoading) {
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
                <BreadcrumbLink asChild>
                  <Link href="/cart">Giỏ hàng</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Thanh toán</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <SpinnerLoading className="py-20" />
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
              <BreadcrumbLink asChild>
                <Link href="/cart">Giỏ hàng</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Thanh toán</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header with title + checkout steps */}
        <div className="mb-4 flex items-end justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="Quay lại giỏ hàng"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                Thanh toán
              </h1>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 text-success" />
                Thanh toán an toàn
              </p>
            </div>
          </div>
          <CheckoutSteps />
        </div>

        <form id="checkout-form" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Main Content */}
            <div className="min-w-0 space-y-4 lg:col-span-8">
              {/* Shipping Address */}
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Địa chỉ nhận hàng</h2>
                </div>

                <div className="p-4">
                  {primaryAddress && hasValidAddress ? (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {primaryAddress.fullName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {primaryAddress.phone}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {primaryAddress.address}, {primaryAddress.ward},{' '}
                            {primaryAddress.district}, {primaryAddress.city}
                          </p>
                          {currentUser?.email && (
                            <p className="text-sm text-muted-foreground">
                              Email tài khoản: {currentUser.email}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/profile?tab=address')}
                          className="shrink-0 rounded-lg border-border text-primary hover:bg-primary-light hover:text-primary"
                        >
                          Thay đổi
                        </Button>
                      </div>

                      <div className="space-y-1.5 border-t border-border pt-3">
                        <Label htmlFor="note" className="text-sm text-muted-foreground">
                          Ghi chú cho shop
                        </Label>
                        <Input
                          id="note"
                          placeholder="Ghi chú cho người giao hàng..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="h-10 rounded-lg border-border focus:border-primary focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-foreground">Chưa có địa chỉ giao hàng</p>
                        <p className="text-sm text-muted-foreground">
                          Vui lòng cập nhật địa chỉ trong hồ sơ để tiếp tục thanh toán.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => router.push('/profile?tab=address')}
                        className="shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
                      >
                        Đi tới hồ sơ
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items by Shop */}
              {itemsByShop.map((shopGroup) => (
                <div
                  key={shopGroup.shop._id}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  {/* Shop Header */}
                  <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
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

                  {/* Items */}
                  {shopGroup.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col gap-3 border-b border-border p-4 last:border-0 sm:flex-row sm:items-center"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-border bg-muted">
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
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                            Không có ảnh
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-1 text-sm text-foreground">
                          {typeof item.productId === 'object' && item.productId
                            ? item.productId.name
                            : 'Sản phẩm'}
                        </h4>
                        {(item.variant || item.size) && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {[item.variant?.color, item.size && `Size: ${item.size}`]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          x{item.quantity}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="font-medium text-primary">
                          {formatCurrency(getEffectivePrice(item) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Shop Voucher */}
                  <div className="flex flex-col gap-2 border-t border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>Voucher của Shop</span>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1 self-start text-sm text-primary sm:self-auto"
                    >
                      <span>Chọn voucher</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Platform Voucher */}
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                  <Tag className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Voucher nền tảng</h2>
                </div>
                <div className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      placeholder="Nhập mã voucher"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={!!appliedPlatformVoucher}
                      className="h-9 w-full rounded-lg border-border text-sm focus:border-primary focus:ring-primary/20 sm:w-48"
                    />
                    {appliedPlatformVoucher ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveVoucher}
                        className="h-9 w-full shrink-0 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/15 sm:w-auto"
                      >
                        Xóa voucher
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading || !promoCode}
                        className="h-9 w-full shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover sm:w-auto"
                      >
                        Áp dụng
                      </Button>
                    )}
                  </div>
                  {appliedPlatformVoucher && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-success">
                      <Check className="h-3 w-3" />
                      Đã áp dụng mã: {appliedPlatformVoucher.code} (-
                      {formatCurrency(appliedPlatformVoucher.discountAmount)})
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                  <Wallet className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Phương thức thanh toán
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card text-foreground hover:border-muted-foreground/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="sr-only"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <Truck
                      className={`h-5 w-5 ${
                        paymentMethod === 'cod' ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          paymentMethod === 'cod' ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        Thanh toán khi nhận hàng
                      </span>
                      <p className="text-xs text-muted-foreground">COD</p>
                    </div>
                    {paymentMethod === 'cod' && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      paymentMethod === 'vnpay'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card text-foreground hover:border-muted-foreground/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="sr-only"
                      checked={paymentMethod === 'vnpay'}
                      onChange={() => setPaymentMethod('vnpay')}
                    />
                    <CreditCard
                      className={`h-5 w-5 ${
                        paymentMethod === 'vnpay' ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          paymentMethod === 'vnpay' ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        VNPay
                      </span>
                      <p className="text-xs text-muted-foreground">Thẻ ATM/Visa/Master</p>
                    </div>
                    {paymentMethod === 'vnpay' && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="min-w-0 lg:col-span-4">
              <div className="rounded-lg border border-border bg-card p-4 lg:sticky lg:top-[124px]">
                <h2 className="mb-3 border-b border-border pb-3 text-base font-bold text-foreground">
                  Chi tiết thanh toán
                </h2>

                {/* Freeship Progress Bar (Tmall/JD style) */}
                {(() => {
                  const baseTotal = checkoutTotal || 0;
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
                        <Truck
                          className={
                            reached ? 'h-3.5 w-3.5 text-success' : 'h-3.5 w-3.5 text-warning'
                          }
                        />
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

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tạm tính ({cartItems.length} sản phẩm)
                    </span>
                    <span className="text-foreground">{formatCurrency(checkoutTotal || 0)}</span>
                  </div>

                  {shopDiscount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Voucher Cửa hàng</span>
                      <span>-{formatCurrency(shopDiscount)}</span>
                    </div>
                  )}

                  {platformDiscount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Voucher nền tảng</span>
                      <span>-{formatCurrency(platformDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="text-success">Miễn phí</span>
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Tổng thanh toán</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(finalTotal > 0 ? finalTotal : 0)}
                      </span>
                    </div>
                    <p className="mt-1 text-right text-xs text-muted-foreground">
                      Đã bao gồm VAT
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  form="checkout-form"
                  className="mt-3 h-11 w-full rounded-lg bg-primary text-base font-medium text-primary-foreground hover:bg-primary-hover"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                </Button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Nhấn &quot;Đặt hàng&quot; đồng nghĩa với việc bạn đồng ý tuân theo Điều khoản của
                  chúng tôi
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Sticky Mobile Place Order Bar (Tmall/JD style) */}
        <div className="sticky bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Tổng thanh toán</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(finalTotal > 0 ? finalTotal : 0)}
            </p>
          </div>
          <Button
            type="submit"
            form="checkout-form"
            className="h-11 shrink-0 rounded-lg bg-primary px-8 font-medium text-primary-foreground hover:bg-primary-hover"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
          </Button>
        </div>
      </div>
    </div>
  );
}
