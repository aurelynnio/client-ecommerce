// CheckoutPage - Taobao Style
"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/hooks/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCreateOrder,
  useCreatePaymentUrl,
  useApplyVoucher,
  useCart,
  useClearCart,
  useProfile,
} from "@/hooks/queries";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";
import { ApplyVoucherResult } from "@/types/voucher";
import { Address } from "@/types/address";
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
} from "lucide-react";
import Link from "next/link";
import { groupCartItemsByShop } from "@/types/cart";
import { getSafeErrorMessage } from "@/api";

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

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod");
  const [promoCode, setPromoCode] = useState<string>("");
  const [appliedShopVoucher, setAppliedShopVoucher] =
    useState<ApplyVoucherResult | null>(null);
  const [appliedPlatformVoucher, setAppliedPlatformVoucher] =
    useState<ApplyVoucherResult | null>(null);
  const [note, setNote] = useState("");

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
    [currentUser?.addresses]
  );
  const hasValidAddress = hasCompleteAddress(primaryAddress);

  useEffect(() => {
    if (cartQuery.isLoading) {
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      router.push("/cart");
      return;
    }
  }, [cartItems, cartQuery.isLoading, router]);

  useEffect(() => {
    if (cartQuery.isLoading || profileQuery.isLoading || !cartItems.length) {
      return;
    }

    if (!hasValidAddress) {
      toast.error(
        "Vui lòng cập nhật địa chỉ nhận hàng trong hồ sơ trước khi thanh toán",
        { id: "checkout-address-required" }
      );
      router.replace("/profile?tab=address");
    }
  }, [
    cartItems.length,
    cartQuery.isLoading,
    hasValidAddress,
    profileQuery.isLoading,
    router,
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!primaryAddress || !hasValidAddress) {
      toast.error("Địa chỉ giao hàng chưa đầy đủ");
      router.push("/profile?tab=address");
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

        if (paymentMethod === "vnpay") {
          try {
            toast.loading("Đang chuyển đến VNPay...");
            const orders = (result as unknown as { orders: { _id: string }[] }).orders;
            const firstOrder = orders?.[0];
            if (!firstOrder?._id) throw new Error("Missing order ID");

            const paymentResult = await paymentMutation.mutateAsync(firstOrder._id);

            if (paymentResult.paymentUrl) {
              window.location.href = paymentResult.paymentUrl;
              return;
            }
          } catch (paymentError: unknown) {
            console.error("Payment error:", paymentError);
            toast.error(
              getSafeErrorMessage(
                paymentError,
                "Không thể tạo thanh toán VNPay. Vui lòng thanh toán lại trong lịch sử đơn hàng.",
              ),
            );
            router.push("/");
          }
        } else {
          toast.success("Đặt hàng thành công!");
          router.push(`/`);
        }
      }
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Đã xảy ra lỗi"));
    }
  };

  const handleApplyVoucher = async () => {
    if (!promoCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    const orderTotal = checkoutTotal || 0;

    try {
      const result = await applyVoucherMutation.mutateAsync({
        code: promoCode,
        orderTotal,
      });
      // Set the appropriate voucher based on scope
      if (result.scope === "shop") {
        setAppliedShopVoucher(result);
      } else {
        setAppliedPlatformVoucher(result);
      }
      toast.success("Áp dụng mã giảm giá thành công!");
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Không thể áp dụng mã giảm giá"));
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedShopVoucher(null);
    setAppliedPlatformVoucher(null);
    setPromoCode("");
    toast.success("Đã xóa mã giảm giá");
  };

  // Helper to get item image
  const getItemImage = (item: (typeof cartItems)[0]): string | null => {
    if (item.variant?.images?.[0]) return item.variant.images[0];
    if (typeof item.productId === "object") {
      if (item.productId.variants?.[0]?.images?.[0])
        return item.productId.variants[0].images[0];
      if (item.productId.descriptionImages?.[0])
        return item.productId.descriptionImages[0];
    }
    return null;
  };

  // Helper to get effective price
  const getEffectivePrice = (item: (typeof cartItems)[0]): number => {
    if (typeof item.price === "number") {
      return item.price;
    }
    const discountPrice = item.price?.discountPrice ?? 0;
    const currentPrice = item.price?.currentPrice ?? 0;
    return discountPrice > 0 && discountPrice < currentPrice
      ? discountPrice
      : currentPrice;
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background py-20 flex items-center justify-center">
        <p className="text-gray-500">Đang chuyển đến giỏ hàng...</p>
      </div>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <div className="w-full min-h-screen bg-background py-20 flex items-center justify-center">
        <p className="text-gray-500">Đang tải địa chỉ giao hàng...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background py-4 -mt-4 -mx-4 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="bg-[#f7f7f7] rounded-sm mb-4 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/cart" className="text-gray-500 hover:text-[#E53935]">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Thanh toán</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Thanh toán an toàn</span>
          </div>
        </div>

        <form id="checkout-form" onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Content */}
            <div className="flex-1 space-y-4">
              {/* Shipping Address */}
              <div className="bg-[#f7f7f7] rounded-sm p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <MapPin className="h-5 w-5 text-[#E53935]" />
                  <h2 className="font-semibold text-gray-800">
                    Địa chỉ nhận hàng
                  </h2>
                </div>

                <div className="rounded border border-gray-200 bg-white p-4">
                  {primaryAddress && hasValidAddress ? (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              {primaryAddress.fullName}
                            </span>
                            <span className="text-sm text-gray-500">
                              {primaryAddress.phone}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {primaryAddress.address}, {primaryAddress.ward},{" "}
                            {primaryAddress.district}, {primaryAddress.city}
                          </p>
                          {currentUser?.email && (
                            <p className="text-sm text-gray-500">
                              Email tài khoản: {currentUser.email}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push("/profile?tab=address")}
                          className="border-gray-200 text-[#E53935] hover:bg-[#E53935]/5 hover:text-[#E53935]"
                        >
                          Cập nhật địa chỉ
                        </Button>
                      </div>

                      <div className="space-y-1.5 border-t border-gray-100 pt-3">
                        <Label htmlFor="note" className="text-sm text-gray-600">
                          Ghi chú
                        </Label>
                        <Input
                          id="note"
                          placeholder="Ghi chú cho người giao hàng..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="h-10 rounded border-gray-200 focus:border-[#E53935] focus:ring-[#E53935]/20"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          Chưa có địa chỉ giao hàng
                        </p>
                        <p className="text-sm text-gray-500">
                          Vui lòng cập nhật địa chỉ trong hồ sơ để tiếp tục thanh toán.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => router.push("/profile?tab=address")}
                        className="bg-[#E53935] hover:bg-[#D32F2F]"
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
                  className="bg-[#f7f7f7] rounded-sm overflow-hidden"
                >
                  {/* Shop Header */}
                  <div className="flex items-center gap-2 p-4 border-b border-gray-100">
                    <Store className="h-4 w-4 text-[#E53935]" />
                    <span className="font-medium text-gray-800">
                      {shopGroup.shop.name}
                    </span>
                    <span className="text-xs text-[#E53935] border border-[#E53935] px-1.5 py-0.5 rounded">
                      Chính hãng
                    </span>
                  </div>

                  {/* Items */}
                  {shopGroup.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-b border-gray-50 last:border-0"
                    >
                      <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                        {getItemImage(item) ? (
                          <Image
                            src={getItemImage(item)!}
                            alt={
                              typeof item.productId === "object" &&
                              item.productId
                                ? item.productId.name
                                : "Sản phẩm"
                            }
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Không có hình ảnh
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-gray-800 line-clamp-1">
                          {typeof item.productId === "object" && item.productId
                            ? item.productId.name
                            : "Sản phẩm"}
                        </h4>
                        {(item.variant || item.size) && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {[
                              item.variant?.color,
                              item.size && `Size: ${item.size}`,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          x{item.quantity}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[#E53935] font-medium">
                          {formatCurrency(getEffectivePrice(item) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Shop Voucher */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50/50 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="h-4 w-4 text-[#E53935]" />
                      <span>Voucher của Shop</span>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm text-[#E53935] self-start sm:self-auto"
                    >
                      <span>Chọn voucher</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Platform Voucher */}
              <div className="bg-[#f7f7f7] rounded-sm p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-[#E53935]" />
                    <span className="font-medium text-gray-800">
                      Voucher nền tảng
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Input
                      placeholder="Nhập mã voucher"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={!!appliedPlatformVoucher}
                      className="h-9 w-full sm:w-40 text-sm rounded border-gray-200"
                    />
                    {appliedPlatformVoucher ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveVoucher}
                        className="h-9 text-red-500 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                      >
                        Xóa
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading || !promoCode}
                        className="h-9 bg-[#E53935] hover:bg-[#D32F2F] w-full sm:w-auto"
                      >
                        Áp dụng
                      </Button>
                    )}
                  </div>
                </div>
                {appliedPlatformVoucher && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Đã áp dụng mã: {appliedPlatformVoucher.code} (-
                    {formatCurrency(appliedPlatformVoucher.discountAmount)})
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-[#f7f7f7] rounded-sm p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <Wallet className="h-5 w-5 text-[#E53935]" />
                  <h2 className="font-semibold text-gray-800">
                    Phương thức thanh toán
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3 rounded border-2 cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-[#E53935] bg-[#E53935]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="sr-only"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <Truck
                      className={`h-5 w-5 ${
                        paymentMethod === "cod"
                          ? "text-[#E53935]"
                          : "text-gray-400"
                      }`}
                    />
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          paymentMethod === "cod"
                            ? "text-[#E53935]"
                            : "text-gray-700"
                        }`}
                      >
                        Thanh toán khi nhận hàng
                      </span>
                      <p className="text-xs text-gray-500">COD</p>
                    </div>
                    {paymentMethod === "cod" && (
                      <Check className="h-4 w-4 text-[#E53935] ml-auto" />
                    )}
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded border-2 cursor-pointer transition-all ${
                      paymentMethod === "vnpay"
                        ? "border-[#E53935] bg-[#E53935]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="sr-only"
                      checked={paymentMethod === "vnpay"}
                      onChange={() => setPaymentMethod("vnpay")}
                    />
                    <CreditCard
                      className={`h-5 w-5 ${
                        paymentMethod === "vnpay"
                          ? "text-[#E53935]"
                          : "text-gray-400"
                      }`}
                    />
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          paymentMethod === "vnpay"
                            ? "text-[#E53935]"
                            : "text-gray-700"
                        }`}
                      >
                        VNPay
                      </span>
                      <p className="text-xs text-gray-500">
                        Thẻ ATM/Visa/Master
                      </p>
                    </div>
                    {paymentMethod === "vnpay" && (
                      <Check className="h-4 w-4 text-[#E53935] ml-auto" />
                    )}
                  </label>

                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-[320px] shrink-0">
              <div className="bg-[#f7f7f7] rounded-sm p-4 lg:sticky lg:top-[140px]">
                <h2 className="font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                  Chi tiết thanh toán
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Tạm tính ({cartItems.length} sản phẩm)
                    </span>
                    <span className="text-gray-800">
                      {formatCurrency(checkoutTotal || 0)}
                    </span>
                  </div>

                  {shopDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Voucher Cửa hàng</span>
                      <span>-{formatCurrency(shopDiscount)}</span>
                    </div>
                  )}

                  {platformDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Voucher nền tảng</span>
                      <span>-{formatCurrency(platformDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        Tổng thanh toán
                      </span>
                      <span className="text-xl font-bold text-[#E53935]">
                        {formatCurrency(finalTotal > 0 ? finalTotal : 0)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-1">
                      Đã bao gồm VAT
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  form="checkout-form"
                  className="w-full h-11 mt-4 bg-[#E53935] hover:bg-[#D32F2F] rounded text-base font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
                </Button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  Nhấn &quot;Đặt hàng&quot; đồng nghĩa với việc bạn đồng ý tuân theo Điều
                  khoản của chúng tôi
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
