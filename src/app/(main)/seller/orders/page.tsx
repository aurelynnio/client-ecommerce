'use client';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMyShop, useShopOrders, useUpdateOrderStatus } from '@/hooks/queries';
import { formatCurrency, formatDate } from '@/utils/format';
import { Order } from '@/types/order';
import { getSafeErrorMessage } from '@/api';

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'text-warning',
    bg: 'bg-warning/15',
    icon: Clock,
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: 'text-info',
    bg: 'bg-info/15',
    icon: CheckCircle2,
  },
  processing: {
    label: 'Đang xử lý',
    color: 'text-primary',
    bg: 'bg-primary/15',
    icon: Package,
  },
  shipped: {
    label: 'Đang giao',
    color: 'text-primary',
    bg: 'bg-primary/15',
    icon: Truck,
  },
  delivered: {
    label: 'Hoàn thành',
    color: 'text-success',
    bg: 'bg-success/15',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'text-destructive',
    bg: 'bg-destructive/15',
    icon: XCircle,
  },
};

// Allowed status transitions for seller
const allowedTransitions: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export default function SellerOrdersPage() {
  const { data: myShop } = useMyShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: ordersData, isLoading: isLoadingShopOrders } = useShopOrders(myShop?._id || '', {
    page,
    limit,
    status:
      statusFilter !== 'all'
        ? (statusFilter as
            'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled')
        : undefined,
  });
  const updateStatusMutation = useUpdateOrderStatus();
  const isUpdating = updateStatusMutation.isPending;

  const orders = ordersData?.orders || [];
  const shopOrdersPagination = ordersData?.pagination;

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const handleSearch = () => {
    setPage(1);
  };

  const handleOpenViewModal = (order: Order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  const handleOpenUpdateStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus('');
    setUpdateStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await updateStatusMutation.mutateAsync({
        orderId: selectedOrder._id,
        status: newStatus as 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
      });
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
      setUpdateStatusModalOpen(false);
      setSelectedOrder(null);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể cập nhật trạng thái đơn hàng'));
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    return allowedTransitions[currentStatus] || [];
  };

  const statusTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'shipped', label: 'Đang giao' },
    { key: 'delivered', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
  ];

  const total = shopOrdersPagination?.totalItems || 0;
  const totalPages = shopOrdersPagination?.totalPages || 0;

  // Get customer name from order
  const getCustomerName = (order: Order): string => {
    if (order.shippingAddress?.fullName) return order.shippingAddress.fullName;
    if (typeof order.userId === 'object' && order.userId?.username) return order.userId.username;
    return 'Khách hàng';
  };

  // Get customer phone from order
  const getCustomerPhone = (order: Order): string => {
    return order.shippingAddress?.phone || '';
  };

  if (!myShop) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Quản lý đơn hàng</h1>
          <p className="text-sm text-muted-foreground">{total} đơn hàng</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-1">
        <div className="flex min-w-max gap-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                statusFilter === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-card hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-11 rounded-lg bg-card pl-11"
            />
          </div>
          <Button variant="outline" className="h-11 w-full rounded-lg px-4 sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {isLoadingShopOrders ? (
          <div className="flex justify-center py-20">
            <SpinnerLoading size={32} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-muted-foreground text-sm">Đơn hàng sẽ xuất hiện khi có khách đặt</p>
          </div>
        ) : (
          <>
            <div>
              {orders.map((order, idx) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const availableStatuses = getAvailableStatuses(order.status);

                return (
                  <div
                    key={order._id}
                    className={`p-5 ${idx % 2 === 0 ? 'bg-card' : 'bg-card/50'}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">
                            #{order.orderCode || order._id.slice(-8).toUpperCase()}
                          </span>
                          <Badge
                            className={`${status.bg} ${status.color} hover:${status.bg} rounded-full`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleOpenViewModal(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {availableStatuses.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleOpenUpdateStatusModal(order)}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Cập nhật trạng thái
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                      {/* Products */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {order.products.slice(0, 3).map((item, i) => (
                            <div
                              key={i}
                              className="relative size-14 overflow-hidden rounded-lg bg-muted"
                            >
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground/60" />
                                </div>
                              )}
                              {item.quantity > 1 && (
                                <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-tl">
                                  x{item.quantity}
                                </span>
                              )}
                            </div>
                          ))}
                          {order.products.length > 3 && (
                            <div className="flex size-14 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                              +{order.products.length - 3}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {order.products.length} sản phẩm
                        </p>
                      </div>

                      {/* Customer */}
                      <div className="w-full lg:w-48">
                        <p className="text-sm font-medium text-foreground">
                          {getCustomerName(order)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{getCustomerPhone(order)}</p>
                      </div>

                      {/* Total */}
                      <div className="text-left lg:text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 bg-card/50">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {orders.length} / {total} đơn hàng
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border-0 bg-card"
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border-0 bg-card"
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Order Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>
              Mã đơn: #{selectedOrder?.orderCode || selectedOrder?._id.slice(-8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <Badge
                  className={`${statusConfig[selectedOrder.status]?.bg} ${
                    statusConfig[selectedOrder.status]?.color
                  } rounded-full`}
                >
                  {statusConfig[selectedOrder.status]?.label}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
                <p className="text-sm">{getCustomerName(selectedOrder)}</p>
                <p className="text-sm text-muted-foreground">{getCustomerPhone(selectedOrder)}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.shippingAddress?.address}</p>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-medium mb-2">Sản phẩm</h4>
                <div className="space-y-2">
                  {selectedOrder.products.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-card">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground/60" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discountShop && selectedOrder.discountShop > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Giảm giá shop:</span>
                    <span>-{formatCurrency(selectedOrder.discountShop)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold mt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={updateStatusModalOpen} onOpenChange={setUpdateStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              Chọn trạng thái mới cho đơn hàng #
              {selectedOrder?.orderCode || selectedOrder?._id.slice(-8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Trạng thái hiện tại:</p>
                <Badge
                  className={`${statusConfig[selectedOrder.status]?.bg} ${
                    statusConfig[selectedOrder.status]?.color
                  } rounded-full`}
                >
                  {statusConfig[selectedOrder.status]?.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Chọn trạng thái mới:</p>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableStatuses(selectedOrder.status).map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusConfig[status]?.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateStatusModalOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={!newStatus || isUpdating}
              className="bg-primary"
            >
              {isUpdating ? <SpinnerLoading size={16} noWrapper className="mr-2" /> : null}
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
