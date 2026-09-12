'use client';
import { Package, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUserOrders, useCancelOrder } from '@/hooks/queries/useOrders';
import { toast } from 'sonner';
import { Order } from '@/types/order';
import OrderCard from '../order/OrderCard';
import OrderDialog from '../order/OrderDialog';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { cn } from '@/lib/utils';
import { getSafeErrorMessage } from '@/api';

type OrderStatus =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export default function OrdersTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, error, refetch } = useUserOrders({ limit: 50 });
  const cancelOrderMutation = useCancelOrder();

  const userOrders = data?.orders || [];
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('all');

  useEffect(() => {
    const requestedStatus = searchParams.get('status') as OrderStatus | null;
    if (
      requestedStatus &&
      ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(
        requestedStatus,
      )
    ) {
      setActiveStatus(requestedStatus);
    }
  }, [searchParams]);

  const handleViewOrder = (orderId: string) => {
    const order = userOrders.find((order) => order._id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    try {
      await cancelOrderMutation.mutateAsync(orderToCancel);
      toast.success('Đã hủy đơn hàng thành công');
      setOrderToCancel(null);
    } catch (error: unknown) {
      console.error('Error cancelling order:', error);
      toast.error(getSafeErrorMessage(error, 'Không thể hủy đơn hàng'));
    } finally {
      setIsCancelling(false);
    }
  };

  // Filter orders by status
  const filteredOrders = userOrders.filter((order) => {
    if (activeStatus === 'all') return true;
    return order.status?.toLowerCase() === activeStatus.toLowerCase();
  });

  const getOrderCount = (status: OrderStatus) => {
    if (status === 'all') return userOrders.length;
    return userOrders.filter((order) => order.status?.toLowerCase() === status.toLowerCase())
      .length;
  };

  const statusTabs: { value: OrderStatus; label: string; count: number }[] = [
    { value: 'all', label: 'Tất cả', count: getOrderCount('all') },
    { value: 'pending', label: 'Chờ xử lý', count: getOrderCount('pending') },
    {
      value: 'confirmed',
      label: 'Đã xác nhận',
      count: getOrderCount('confirmed'),
    },
    {
      value: 'processing',
      label: 'Đang xử lý',
      count: getOrderCount('processing'),
    },
    { value: 'shipped', label: 'Đang giao', count: getOrderCount('shipped') },
    {
      value: 'delivered',
      label: 'Đã giao',
      count: getOrderCount('delivered'),
    },
    {
      value: 'cancelled',
      label: 'Đã hủy',
      count: getOrderCount('cancelled'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Đơn hàng của tôi</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý và theo dõi trạng thái tất cả đơn hàng đã đặt
        </p>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <SpinnerLoading size={40} className="text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-destructive/30 rounded-md bg-destructive/5 p-6">
            <p className="text-destructive font-medium mb-1">Không thể tải danh sách đơn hàng</p>
            <p className="text-xs text-muted-foreground mb-4">Vui lòng thử lại sau</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Thử lại
            </Button>
          </div>
        ) : userOrders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Bạn chưa có đơn hàng nào"
            description="Hãy khám phá các sản phẩm và bắt đầu mua sắm ngay hôm nay!"
            action={{
              label: 'Khám phá sản phẩm',
              onClick: () => router.push('/products'),
              variant: 'default',
            }}
            className="my-8"
          />
        ) : (
          <>
            <Tabs
              value={activeStatus}
              onValueChange={(value) => setActiveStatus(value as OrderStatus)}
              className="w-full"
            >
              <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                <TabsList className="h-auto p-1 bg-muted/30 rounded-md inline-flex w-auto min-w-full sm:min-w-0">
                  {statusTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        'rounded-sm px-4 py-2 text-xs font-medium transition-[background-color,color,box-shadow] duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
                        tab.count === 0 && 'text-muted-foreground/60',
                      )}
                    >
                      {tab.label}
                      {tab.count > 0 && <span className="ml-1.5 opacity-70">({tab.count})</span>}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeStatus} className="mt-6 space-y-4">
                {filteredOrders.length === 0 ? (
                  <EmptyState
                    icon={Filter}
                    title={`Không có đơn hàng ${activeStatus === 'all' ? '' : statusTabs.find((t) => t.value === activeStatus)?.label}`}
                    description="Chúng tôi không tìm thấy đơn hàng nào với trạng thái này."
                    className="my-8"
                  />
                ) : (
                  <div className="grid gap-4">
                    {filteredOrders.map((order: Order, index: number) => (
                      <OrderCard
                        key={order._id || `order-${index}`}
                        order={order}
                        onViewOrder={handleViewOrder}
                        onCancelOrder={(id) => setOrderToCancel(id)}
                        isCancelling={orderToCancel === order._id && isCancelling}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <OrderDialog order={selectedOrder} open={isDialogOpen} onClose={handleCloseDialog} />

            <ConfirmDialog
              open={!!orderToCancel}
              onOpenChange={(open) => !open && setOrderToCancel(null)}
              title="Xác nhận hủy đơn hàng"
              description="Bạn có chắc chắn muốn hủy đơn hàng này không? Thao tác này không thể hoàn tác."
              confirmLabel="Hủy đơn hàng"
              variant="destructive"
              isLoading={isCancelling}
              onConfirm={handleConfirmCancel}
            />
          </>
        )}
      </div>
    </div>
  );
}
