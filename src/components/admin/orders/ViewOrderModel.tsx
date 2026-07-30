import { Order } from '@/types/order';
import { Shop } from '@/types/shop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Package, Store } from 'lucide-react';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  adminDialogContentClass,
  adminInsetPanelClass,
  adminPrimaryButtonClass,
} from '@/components/admin/shared/AdminPrimitives';
import { cn } from '@/utils/cn';

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (order: Order) => void;
  order: Order | null;
}

const ORDER_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export function ViewOrderModal({ isOpen, onClose, onEdit, order }: ViewOrderModalProps) {
  if (!order) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
      };
    } = {
      pending: { label: 'Chờ xử lý', variant: 'secondary' },
      confirmed: { label: 'Đã xác nhận', variant: 'outline' },
      processing: { label: 'Đang xử lý', variant: 'default' },
      shipped: { label: 'Đang giao', variant: 'default' },
      delivered: { label: 'Đã giao', variant: 'outline' },
      cancelled: { label: 'Đã hủy', variant: 'destructive' },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: 'secondary',
    };

    return (
      <Badge variant={config.variant} className="rounded-lg">
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
      };
    } = {
      unpaid: { label: 'Chưa thanh toán', variant: 'secondary' },
      paid: { label: 'Đã thanh toán', variant: 'outline' },
      refunded: { label: 'Hoàn tiền', variant: 'destructive' },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: 'secondary',
    };

    return (
      <Badge variant={config.variant} className="rounded-lg">
        {config.label}
      </Badge>
    );
  };

  const getShopInfo = (
    shopId: string | Shop | undefined,
  ): { name: string; logo?: string; slug?: string } => {
    if (!shopId) return { name: 'N/A' };
    if (typeof shopId === 'string') return { name: shopId };
    return { name: shopId.name || 'N/A', logo: shopId.logo, slug: shopId.slug };
  };

  const shopInfo = getShopInfo(order.shopId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          adminDialogContentClass,
          'max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar p-6',
        )}
      >
        <DialogHeader className="border-b border-border/50 pb-4">
          <DialogTitle className="flex justify-between items-center">
            <span className="text-xl font-semibold tracking-tight">
              Chi tiết đơn hàng #{order._id.slice(-8).toUpperCase()}
            </span>
            <Button onClick={() => onEdit(order)} className={cn('gap-2', adminPrimaryButtonClass)}>
              <Edit className="w-4 h-4" />
              Cập nhật
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Thông tin đơn hàng */}
          <div className={cn(adminInsetPanelClass, 'p-5 space-y-4')}>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Thông tin đơn hàng
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-medium">#{order._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày đặt:</span>
                <span>{formatDate(order.createdAt, ORDER_DATE_TIME_OPTIONS)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Trạng thái:</span>
                <span>{getStatusBadge(order.status)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Thanh toán:</span>
                <span>{getPaymentStatusBadge(order.paymentStatus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phương thức:</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Shop Information */}
          {order.shopId && (
            <div className={cn(adminInsetPanelClass, 'p-5 space-y-4')}>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Thông tin cửa hàng
              </h3>
              <div className="flex items-center gap-3">
                {shopInfo.logo ? (
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-muted border border-border/50">
                    <Image src={shopInfo.logo} alt={shopInfo.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center border border-border/50">
                    <Store className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{shopInfo.name}</p>
                  {shopInfo.slug && (
                    <p className="text-xs text-muted-foreground">@{shopInfo.slug}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Thông tin khách hàng & Địa chỉ */}
          <div className="space-y-4">
            <div className={cn(adminInsetPanelClass, 'p-5 space-y-4')}>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Khách hàng & Giao hàng
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tên:</span>
                  <span className="font-medium">{order.shippingAddress.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Điện thoại:</span>
                  <span>{order.shippingAddress.phone}</span>
                </div>
                <div className="border-t border-border/50 pt-2 mt-2">
                  <div className="text-muted-foreground mb-1">Địa chỉ:</div>
                  <div className="font-medium">{order.shippingAddress.address}</div>
                  {order.shippingAddress.ward && (
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {order.shippingAddress.ward}, {order.shippingAddress.district}
                    </div>
                  )}
                  <div className="text-muted-foreground text-xs">{order.shippingAddress.city}</div>
                </div>
                {order.shippingAddress.note && (
                  <div className="mt-2 text-xs bg-warning/15 text-warning p-2 rounded-lg border border-warning/30">
                    <span className="font-medium">Ghi chú: </span>
                    {order.shippingAddress.note}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chi tiết sản phẩm */}
        <div className="space-y-4 mt-2">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground px-1">
            Chi tiết sản phẩm
          </h3>
          <div className="border border-border/50 rounded-2xl overflow-hidden bg-card/40">
            <table className="w-full text-sm">
              <thead className="bg-muted/80 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-4 font-medium">Sản phẩm</th>
                  <th className="text-left p-4 font-medium">Đơn giá</th>
                  <th className="text-center p-4 font-medium">SL</th>
                  <th className="text-right p-4 font-medium">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {order.products?.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden border border-border/50">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{item.name}</div>
                          {item.variationInfo && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {item.variationInfo}
                            </div>
                          )}
                          {item.sku && (
                            <div className="text-xs text-muted-foreground font-mono mt-0.5">
                              SKU: {item.sku}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatCurrency(item.price)}</td>
                    <td className="p-4 text-center">{item.quantity}</td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/80 border-t border-border/50 font-semibold">
                <tr>
                  <td colSpan={3} className="p-4 text-right">
                    Tổng cộng
                  </td>
                  <td className="p-4 text-right text-base text-black">
                    {formatCurrency(order.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
