'use client';
import { useState, useMemo } from 'react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import {
  useAllOrders,
  useOrder,
  useUpdateOrderStatus,
  useCancelOrder,
  useOrderStatistics,
} from '@/hooks/queries/useOrders';
import { useAllShops } from '@/hooks/queries/useShop';
import { toast } from 'sonner';
import { PaginationControls } from '@/components/common/Pagination';
import { Order, OrderFilters } from '@/types/order';
import { Shop } from '@/types/shop';
import { OrdersHeader } from '@/components/admin/orders/OrdersHeader';
import { OrdersStats } from '@/components/admin/orders/OrderStats';
import { OrdersTable } from '@/components/admin/orders/OrderTable';
import { EditOrderModal } from '@/components/admin/orders/UpdateOrderModel';
import { ViewOrderModal } from '@/components/admin/orders/ViewOrderModel';
import { Button } from '@/components/ui/button';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { getSafeErrorMessage } from '@/api';

export default function OrdersAdminPage() {
  const { filters, updateFilter, updateFilters, resetFilters } = useUrlFilters<OrderFilters>({
    defaultFilters: {
      page: 1,
      limit: 10,
      search: '',
      status: '',
      paymentStatus: '',
      paymentMethod: '',
      userId: '',
      shop: '',
      startDate: '',
      endDate: '',
    },
    basePath: '/admin/orders',
  });

  const currentPage = Number(filters.page);
  const pageSize = Number(filters.limit);
  const searchTerm = filters.search as string;
  const statusFilter = filters.status as string;
  const paymentStatusFilter = filters.paymentStatus as string;
  const paymentMethodFilter = filters.paymentMethod as string;
  const userIdFilter = filters.userId as string;
  const shopFilter = filters.shop as string;
  const startDate = filters.startDate as string;
  const endDate = filters.endDate as string;

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {
      page: currentPage,
      limit: pageSize,
    };
    if (searchTerm) params.search = searchTerm;
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
    if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter;
    if (userIdFilter) params.userId = userIdFilter;
    if (shopFilter && shopFilter !== 'all') params.shop = shopFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [
    currentPage,
    pageSize,
    searchTerm,
    statusFilter,
    paymentStatusFilter,
    paymentMethodFilter,
    userIdFilter,
    shopFilter,
    startDate,
    endDate,
  ]);

  const { data: ordersData, isLoading, error, refetch } = useAllOrders(queryParams);
  const { data: shopsData } = useAllShops();
  const { data: statistics } = useOrderStatistics();
  const updateOrderMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();

  const orders: Order[] = ordersData?.orders ?? [];
  const pagination = ordersData?.pagination ?? null;
  const shops: Shop[] = (shopsData?.shops as unknown as Shop[]) || [];

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

  const { data: orderDetail } = useOrder(viewingOrderId || '', {
    enabled: !!viewingOrderId,
  });

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditModalOpen(true);
  };

  const handleEditFromView = (order: Order) => {
    setSelectedOrder(order);
    setViewModalOpen(false);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSaveOrder = async (orderData: { status: string }) => {
    if (!selectedOrder) return;

    if (selectedOrder.status === 'cancelled' && orderData.status !== 'cancelled') {
      toast.error('Cannot change status of cancelled order');
      return;
    }

    if (selectedOrder.status === 'delivered' && orderData.status === 'cancelled') {
      toast.error('Cannot cancel delivered order');
      return;
    }

    try {
      await updateOrderMutation.mutateAsync({
        orderId: selectedOrder._id,
        status: orderData.status as
          'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
      });

      handleCloseEditModal();
      toast.success('Order status updated successfully');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Failed to update status. Please try again.'));
    }
  };

  const isUpdating = updateOrderMutation.isPending;

  const handlePageChange = (page: number) => {
    updateFilter('page', page);
  };

  const handlePageSizeChange = (size: number) => {
    updateFilters({ limit: size, page: 1 });
  };

  const handleSearch = (value: string) => {
    updateFilters({ search: value, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    updateFilters({ status: status, page: 1 });
  };

  const handlePaymentStatusFilter = (paymentStatus: string) => {
    updateFilters({ paymentStatus: paymentStatus, page: 1 });
  };

  const handlePaymentMethodFilter = (paymentMethod: string) => {
    updateFilters({ paymentMethod: paymentMethod, page: 1 });
  };

  const handleUserIdFilter = (userId: string) => {
    updateFilters({ userId: userId, page: 1 });
  };

  const handleShopFilter = (shop: string) => {
    updateFilters({ shop: shop === 'all' ? '' : shop, page: 1 });
  };

  const handleDateFilter = (start: string, end: string) => {
    updateFilters({ startDate: start, endDate: end, page: 1 });
  };

  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setSelectedOrder(null);
    setViewingOrderId(null);
  };

  const handleDeleteOrder = async (order: Order) => {
    if (confirm(`Are you sure you want to cancel order ${order._id}?`)) {
      try {
        await cancelOrderMutation.mutateAsync(order._id);
        toast.success('Order cancelled successfully');
      } catch (error: unknown) {
        toast.error(getSafeErrorMessage(error, 'Failed to cancel order'));
      }
    }
  };

  const handleViewOrder = async (order: Order) => {
    setViewingOrderId(order._id);
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <OrdersHeader />
        <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-muted/50">
          <SpinnerLoading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <OrdersHeader />
        <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-muted/50">
          <div className="text-destructive text-center">
            <div className="text-lg font-semibold mb-2">Error loading orders</div>
            <div>{getSafeErrorMessage(error, 'Không thể tải danh sách đơn hàng')}</div>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      <OrdersHeader />

      {statistics && <OrdersStats {...statistics} />}

      <div className="space-y-6">
        <OrdersTable
          orders={orders}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          paymentStatusFilter={paymentStatusFilter}
          paymentMethodFilter={paymentMethodFilter}
          userIdFilter={userIdFilter}
          pageSize={pageSize}
          isLoading={isLoading}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onPaymentStatusFilter={handlePaymentStatusFilter}
          onPaymentMethodFilter={handlePaymentMethodFilter}
          onUserIdFilter={handleUserIdFilter}
          onResetFilters={handleResetFilters}
          onPageSizeChange={handlePageSizeChange}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onView={handleViewOrder}
          onShopFilterChange={handleShopFilter}
          onDateFilter={handleDateFilter}
          startDate={startDate}
          endDate={endDate}
          selectedShop={shopFilter || 'all'}
          shops={shops}
        />

        <div className="flex justify-center">
          <PaginationControls
            pagination={pagination}
            onPageChange={handlePageChange}
            itemName="orders"
          />
        </div>

        <ViewOrderModal
          isOpen={viewModalOpen}
          onClose={handleCloseModals}
          onEdit={handleEditFromView}
          order={orderDetail || selectedOrder}
        />

        <EditOrderModal
          key={selectedOrder?._id}
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveOrder}
          order={selectedOrder}
          isLoading={isUpdating}
        />
      </div>
    </div>
  );
}
