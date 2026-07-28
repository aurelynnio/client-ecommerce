import { Clock, CheckCircle, DollarSign, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { AdminStatCard, AdminStatsGrid } from '@/components/admin/shared/AdminPrimitives';

interface OrderStatusCount {
  _id: string;
  count: number;
}

interface OrdersStatsProps {
  totalOrders?: number;
  pendingOrders?: number;
  confirmedOrders?: number;
  processingOrders?: number;
  shippedOrders?: number;
  deliveredOrders?: number;
  cancelledOrders?: number;
  totalRevenue?: number;
  ordersByStatus?: OrderStatusCount[];
}

export function OrdersStats({
  totalOrders = 0,
  pendingOrders = 0,
  confirmedOrders = 0,
  processingOrders = 0,
  shippedOrders = 0,
  deliveredOrders = 0,
  cancelledOrders = 0,
  totalRevenue = 0,
  ordersByStatus = [],
}: OrdersStatsProps) {
  const fallbackStats = {
    total: totalOrders,
    pending: pendingOrders,
    confirmed: confirmedOrders,
    processing: processingOrders,
    shipped: shippedOrders,
    delivered: deliveredOrders,
    cancelled: cancelledOrders,
    revenue: totalRevenue,
  };

  const statsByStatus = new Map(ordersByStatus.map((item) => [item._id, item.count]));
  const calculatedStats =
    ordersByStatus.length > 0
      ? {
          total: ordersByStatus.reduce((sum, item) => sum + item.count, 0),
          pending: statsByStatus.get('pending') || 0,
          confirmed: statsByStatus.get('confirmed') || 0,
          processing: statsByStatus.get('processing') || 0,
          shipped: statsByStatus.get('shipped') || 0,
          delivered: statsByStatus.get('delivered') || 0,
          cancelled: statsByStatus.get('cancelled') || 0,
          revenue: totalRevenue,
        }
      : fallbackStats;

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const stats = [
    {
      title: 'Tổng đơn hàng',
      value: formatNumber(calculatedStats.total),
      icon: ShoppingCart,
    },
    {
      title: 'Chờ xử lý',
      value: formatNumber(calculatedStats.pending),
      icon: Clock,
    },
    {
      title: 'Đã giao',
      value: formatNumber(calculatedStats.delivered),
      icon: CheckCircle,
    },
    {
      title: 'TỔNG DOANH THU',
      value: formatCurrency(calculatedStats.revenue),
      icon: DollarSign,
    },
  ];

  return (
    <AdminStatsGrid>
      {stats.map((stat, index) => (
        <AdminStatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          accent={index === 1 ? 'amber' : index === 2 ? 'green' : index === 3 ? 'blue' : 'brand'}
        />
      ))}
    </AdminStatsGrid>
  );
}
