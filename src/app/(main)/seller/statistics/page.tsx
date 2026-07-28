'use client';

import { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { useShopStatistics } from '@/hooks/queries/useShop';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { formatCurrency } from '@/utils/format';

type Period = 'week' | 'month' | 'year';

const periods: { key: Period; label: string }[] = [
  { key: 'week', label: '7 ngày' },
  { key: 'month', label: '30 ngày' },
  { key: 'year', label: '12 tháng' },
];

const orderStatusLabels = [
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipped', label: 'Đang giao' },
  { key: 'delivered', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
] as const;

const compactNumber = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

const calculateChange = (current: number, previous: number) => {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export default function SellerStatisticsPage() {
  const { data: statistics, isLoading, error, refetch } = useShopStatistics();
  const [period, setPeriod] = useState<Period>('month');

  const chartData = useMemo(() => statistics?.chartData || [], [statistics?.chartData]);

  const scopedChartData = useMemo(() => {
    if (period === 'year') return chartData;
    if (period === 'month') return chartData.slice(-6);
    return chartData.slice(-3);
  }, [chartData, period]);

  const latestPoint = scopedChartData[scopedChartData.length - 1];
  const previousPoint = scopedChartData[scopedChartData.length - 2];

  const revenueChange = calculateChange(latestPoint?.revenue || 0, previousPoint?.revenue || 0);

  const ordersChange = calculateChange(latestPoint?.orders || 0, previousPoint?.orders || 0);

  const soldProducts = statistics?.topProducts?.reduce((acc, item) => acc + item.sold, 0) || 0;

  const orderStatusChartData = orderStatusLabels.map(({ key, label }) => ({
    status: label,
    total: statistics?.stats?.ordersByStatus?.[key] || 0,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <SpinnerLoading size={32} />
          <p className="text-sm font-medium text-muted-foreground">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Không thể tải dữ liệu thống kê</p>
          <Button onClick={() => refetch()} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Thống kê</h1>
            <p className="text-sm text-muted-foreground">Phân tích hiệu suất shop của bạn</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                period === p.key
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Doanh thu"
          value={formatCurrency(statistics.stats.totalRevenue)}
          change={revenueChange}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Đơn hàng"
          value={statistics.stats.totalOrders}
          change={ordersChange}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Sản phẩm đã bán"
          value={soldProducts}
          subtext={`${statistics.stats.totalProducts} sản phẩm đang kinh doanh`}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Người theo dõi"
          value={statistics.shop.followers}
          icon={Users}
          subtext={`Tỷ lệ phản hồi ${statistics.shop.responseRate}%`}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Doanh thu theo thời gian</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              <Calendar className="h-4 w-4 mr-1" />
              {period === 'year' ? '12 tháng' : period === 'month' ? '6 tháng' : '3 mốc'}
            </Button>
          </div>
          <div className="h-64 rounded-lg bg-muted/30 p-3">
            {scopedChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scopedChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => compactNumber(Number(value))}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                    labelFormatter={(label) => `Mốc: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-2)"
                    fill="var(--chart-2)"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Đơn hàng theo trạng thái</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Tổng quan
            </Button>
          </div>
          <div className="h-64 rounded-lg bg-muted/30 p-3">
            {orderStatusChartData.some((item) => item.total > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value: number) => [value, 'Đơn hàng']} />
                  <Bar dataKey="total" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Chưa có dữ liệu đơn hàng
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-foreground">Sản phẩm bán chạy</h3>
          <Button variant="ghost" size="sm" className="text-primary">
            Xem tất cả
          </Button>
        </div>
        {statistics.topProducts.length > 0 ? (
          <div className="space-y-3">
            {statistics.topProducts.slice(0, 5).map((product, index) => (
              <div
                key={product._id}
                className="flex items-center justify-between rounded-lg bg-muted/40 p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Đã bán: {product.sold}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-primary">
                  {formatCurrency(product.revenue)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg bg-muted/30">
            <div className="text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có dữ liệu sản phẩm bán chạy</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  subtext?: string;
  icon: React.ElementType;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

const colorMap = {
  green: { icon: 'bg-success/15', text: 'text-success' },
  blue: { icon: 'bg-info/15', text: 'text-info' },
  purple: { icon: 'bg-primary/15', text: 'text-primary' },
  orange: { icon: 'bg-warning/15', text: 'text-warning' },
};

const StatCard = ({ title, value, change, subtext, icon: Icon, color }: StatCardProps) => {
  const colors = colorMap[color];
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex size-10 items-center justify-center rounded-lg ${colors.icon}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm ${
              isPositive ? 'text-success' : 'text-destructive'
            }`}
          >
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{subtext || title}</p>
    </div>
  );
};
