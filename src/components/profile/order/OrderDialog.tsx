"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/order";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  MapPin,
  CreditCard,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreatePaymentUrl } from "@/hooks/queries";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/utils/format";
import { getSafeErrorMessage } from "@/api";

interface OrderDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

const ORDER_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export default function OrderDialog({
  order,
  open,
  onClose,
}: OrderDialogProps) {
  const paymentMutation = useCreatePaymentUrl();
  const isPaying = paymentMutation.isPending;

  if (!order) return null;

  const handlePayment = async () => {
    if (!order) return;
    try {
      toast.loading("Đang chuyển hướng đến VNPay...");
      const result = await paymentMutation.mutateAsync(order._id);
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      }
    } catch (error: unknown) {
      console.error("Payment error:", error);
      toast.error(getSafeErrorMessage(error, "Không thể tạo thanh toán. Vui lòng thử lại."));
    }
  };

  const getStatusConfig = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "text-amber-500",
          bg: "bg-amber-50",
          label: "Chờ xử lý",
        };
      case "confirmed":
      case "processing":
        return {
          icon: RefreshCw,
          color: "text-blue-500",
          bg: "bg-blue-50",
          label: "Đang xử lý",
        };
      case "shipped":
        return {
          icon: Truck,
          color: "text-purple-500",
          bg: "bg-purple-50",
          label: "Đang giao hàng",
        };
      case "delivered":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bg: "bg-green-50",
          label: "Đã giao hàng",
        };
      case "cancelled":
        return {
          icon: XCircle,
          color: "text-red-500",
          bg: "bg-red-50",
          label: "Đã hủy",
        };
      default:
        return {
          icon: Package,
          color: "text-gray-500",
          bg: "bg-gray-50",
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const displayId = order.orderCode
    ? `#${order.orderCode}`
    : `#${order._id?.slice(-8).toUpperCase()}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-7xl w-full overflow-hidden p-0 gap-0 rounded-2xl">
        <DialogHeader className="p-6 border-b border-border/50 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                Đơn hàng {displayId}
              </DialogTitle>
              <DialogDescription className="mt-1.5 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {formatDate(order.createdAt, ORDER_DATE_TIME_OPTIONS)}
              </DialogDescription>
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium w-fit",
                statusConfig.bg,
                statusConfig.color
              )}
            >
              <StatusIcon className="h-4 w-4" />
              {statusConfig.label}
            </div>
          </div>
        </DialogHeader>

        <div className="grid lg:grid-cols-[1fr_340px] h-full max-h-[80vh]">
          {/* Main Content: Products */}
          <div className="overflow-y-auto p-6 lg:p-8 space-y-8 bg-background">
            <div>
              <h3 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-wider">
                Sản phẩm ({order.products.length})
              </h3>
              <div className="space-y-6">
                {order.products.map((product, index) => (
                  <div
                    key={product.productId + index}
                    className="flex gap-4 sm:gap-6 items-center group"
                  >
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border border-border/60 bg-[#f7f7f7] flex-shrink-0">
                      <Image
                        src={product.image || "/images/placeholder-product.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="space-y-1">
                          <p className="font-semibold text-base text-foreground line-clamp-2 leading-tight">
                            {product.name}
                          </p>
                          {(product.color || product.size) && (
                            <p className="text-sm text-muted-foreground">
                              {[product.color, product.size]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          )}
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="font-semibold text-base">
                            {formatCurrency(product.price)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            x{product.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Summary & Details */}
          <div className="bg-muted/30 border-t lg:border-t-0 lg:border-l border-border/50 p-6 lg:p-8 space-y-8 overflow-y-auto">
            {/* Payment & Actions */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Thanh toán
              </h3>
              <div className="bg-[#f7f7f7] rounded-2xl p-4 border border-border/60 space-y-4">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Phương thức</span>
                  <span className="font-medium">
                    {order.paymentMethod === "cod"
                      ? "Thanh toán khi nhận hàng"
                      : "Ví VNPay"}
                  </span>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Trạng thái</span>
                  <Badge
                    variant={
                      order.paymentStatus === "paid" ? "outline" : "secondary"
                    }
                    className={cn(
                      "rounded-lg px-2.5 font-medium border-0",
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-900"
                    )}
                  >
                    {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                  </Badge>
                </div>
                {order.paymentMethod === "vnpay" &&
                  order.paymentStatus === "unpaid" && (
                    <Button
                      onClick={handlePayment}
                      disabled={isPaying}
                      className="w-full rounded-xl mt-2"
                      size="sm"
                    >
                      {isPaying ? "Đang xử lý..." : "Thanh toán ngay"}
                    </Button>
                  )}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Giao hàng
              </h3>
              <div className="text-sm space-y-1.5 text-muted-foreground bg-background/50 p-4 rounded-2xl border border-border/40">
                <p className="font-semibold text-foreground text-base">
                  {order.shippingAddress.fullName}
                </p>
                <p className="font-mono text-xs text-muted-foreground/80">
                  {order.shippingAddress.phone}
                </p>
                <p className="leading-relaxed mt-2 text-[13px]">
                  {[
                    order.shippingAddress.address,
                    order.shippingAddress.ward,
                    order.shippingAddress.district,
                    order.shippingAddress.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* Order Calculation */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {(order.discountShop ?? 0) + (order.discountPlatform ?? 0) >
                0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>Giảm giá</span>
                  <span>
                    -
                    {formatCurrency(
                      (order.discountShop ?? 0) + (order.discountPlatform ?? 0)
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <Separator className="my-2 bg-border/60" />
              <div className="flex justify-between text-lg font-bold tracking-tight text-foreground">
                <span>Tổng cộng</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
