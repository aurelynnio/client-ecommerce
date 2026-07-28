import { Image as ImageIcon, CheckCircle, Eye, MousePointer2 } from 'lucide-react';
import { AdminStatCard, AdminStatsGrid } from '@/components/admin/shared/AdminPrimitives';

interface BannersStatsProps {
  totalBanners: number;
  activeBanners: number;
  clickThroughRate?: string;
  totalViews?: string;
}

export function BannersStats({
  totalBanners,
  activeBanners,
  clickThroughRate = '4.2%',
  totalViews = '12.5k',
}: BannersStatsProps) {
  const stats = [
    {
      title: 'Tổng Banner',
      value: totalBanners,
      description: 'Số lượng trong kho',
      icon: ImageIcon,
    },
    {
      title: 'Đang hiển thị',
      value: activeBanners,
      description: 'Banner đang hoạt động',
      icon: CheckCircle,
    },
    {
      title: 'Tỷ lệ nhấp (CTR)',
      value: clickThroughRate,
      description: 'Tỷ lệ người dùng nhấp',
      icon: MousePointer2,
    },
    {
      title: 'Tổng lượt xem',
      value: totalViews,
      description: 'Lượt hiển thị tích lũy',
      icon: Eye,
    },
  ];

  return (
    <AdminStatsGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <AdminStatCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          accent={index === 2 ? 'amber' : index === 3 ? 'blue' : 'brand'}
        />
      ))}
    </AdminStatsGrid>
  );
}
