import { Ticket, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import { AdminStatCard, AdminStatsGrid } from '@/components/admin/shared/AdminPrimitives';

interface VouchersStatsProps {
  totalVouchers: number;
  activeVouchers: number;
  expiredVouchers: number;
  highUsageVouchers: number;
}

export function VouchersStats({
  totalVouchers,
  activeVouchers,
  expiredVouchers,
  highUsageVouchers,
}: VouchersStatsProps) {
  const stats = [
    {
      title: 'Tổng Mã giảm giá',
      value: totalVouchers,
      icon: Ticket,
      description: 'Tất cả mã giảm giá',
    },
    {
      title: 'Đang hoạt động',
      value: activeVouchers,
      icon: BarChart3,
      description: 'Mã đang hiệu lực',
    },
    {
      title: 'Đã hết hạn',
      value: expiredVouchers,
      icon: Clock,
      description: 'Mã đã quá hạn',
    },
    {
      title: 'Sắp hết lượt',
      value: highUsageVouchers,
      icon: AlertCircle,
      description: 'Đã dùng >80% giới hạn',
    },
  ];

  return (
    <AdminStatsGrid>
      {stats.map((stat, index) => (
        <AdminStatCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          accent={index === 1 ? 'green' : index === 2 ? 'slate' : index === 3 ? 'amber' : 'brand'}
        />
      ))}
    </AdminStatsGrid>
  );
}
