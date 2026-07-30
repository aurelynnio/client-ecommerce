'use client';
import { Clock, Truck, CheckCircle, XCircle, RefreshCw, Package, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order, OrderProduct } from '@/types/order';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/utils/format';

interface OrderCardProps {
  order: Order;
  onViewOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  isCancelling: boolean;
}

const ORDER_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export default function OrderCard({
  order,
  onViewOrder,
  onCancelOrder,
  isCancelling,
}: OrderCardProps) {
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-warning', bg: 'bg-warning/15', label: 'Chờ xử lý' };
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'text-info',
          bg: 'bg-info/15',
          label: 'Đã xác nhận',
        };
      case 'processing':
        return {
          icon: RefreshCw,
          color: 'text-info',
          bg: 'bg-info/15',
          label: 'Đang xử lý',
        };
      case 'shipped':
        return {
          icon: Truck,
          color: 'text-info',
          bg: 'bg-info/15',
          label: 'Đang giao hàng',
        };
      case 'delivered':
        return {
          icon: CheckCircle,
          color: 'text-success',
          bg: 'bg-success/15',
          label: 'Đã giao hàng',
        };
      case 'cancelled':
        return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/15', label: 'Đã hủy' };
      default:
        return { icon: Package, color: 'text-muted-foreground', bg: 'bg-muted/50', label: status };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const getProductImage = (product: OrderProduct) => {
    return product.image || '/images/placeholder-product.svg';
  };

  const displayId = order.orderCode
    ? `#${order.orderCode}`
    : `#${order._id?.slice(-8).toUpperCase()}`;

  return (
    <div className="group relative rounded-lg border border-border/50 bg-card p-5 transition-[border-color,box-shadow] duration-200 hover:border-border">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-semibold text-base tracking-tight">{displayId}</span>
            <div
              className={cn(
                'flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium',
                statusConfig.bg,
                statusConfig.color,
              )}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Đã đặt vào ngày {formatDate(order.createdAt, ORDER_DATE_OPTIONS)}
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xl font-semibold tracking-tight">
            {formatCurrency(order.totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
            {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </p>
        </div>
      </div>

      {/* Product Preview */}
      <div className="flex items-center gap-3 mb-5 bg-muted/30 p-3 rounded-md">
        {order.products?.slice(0, 3).map((product, i) => (
          <div
            key={i}
            className="relative h-12 w-12 rounded-sm overflow-hidden border border-border bg-background"
          >
            <Image
              src={getProductImage(product)}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
            />
            {product.quantity > 1 && (
              <span className="absolute bottom-0 right-0 bg-foreground text-background text-[10px] px-1 rounded-tl-sm">
                x{product.quantity}
              </span>
            )}
          </div>
        ))}
        {(order.products?.length || 0) > 3 && (
          <div className="h-12 w-12 rounded-sm bg-muted flex items-center justify-center border border-border text-xs font-medium text-muted-foreground">
            +{order.products!.length - 3}
          </div>
        )}
        <div className="ml-2 flex-1">
          <p className="text-sm font-medium line-clamp-1">{order.products?.[0]?.name}</p>
          <p className="text-xs text-muted-foreground">
            {(order.products?.length || 0) > 1
              ? `và ${order.products!.length - 1} sản phẩm khác`
              : 'x' + (order.products?.[0]?.quantity || 1)}
          </p>
        </div>
      </div>

      {/* Address Summary (Collapsed) */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground mb-5 pl-1">
        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <p className="line-clamp-1">
          <span className="text-foreground font-medium">{order.shippingAddress?.fullName}</span>
          <span className="mx-2">•</span>
          {order.shippingAddress?.address}, {order.shippingAddress?.city}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
        <Button
          onClick={() => onViewOrder(order._id!)}
          className="rounded-lg flex-1 md:flex-none"
          variant="secondary"
        >
          Xem chi tiết
        </Button>

        {(order.status === 'pending' || order.status === 'confirmed') &&
          order.paymentStatus !== 'paid' && (
            <Button
              variant="ghost"
              onClick={() => onCancelOrder(order._id!)}
              disabled={isCancelling}
              className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive md:flex-none flex-1"
            >
              {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
            </Button>
          )}
      </div>
    </div>
  );
}
