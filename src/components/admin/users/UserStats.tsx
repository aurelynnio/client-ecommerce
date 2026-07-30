import { Users, UserCheck, MailCheck, MapPin } from 'lucide-react';
import { AdminStatCard, AdminStatsGrid } from '@/components/admin/shared/AdminPrimitives';

interface UsersStatsProps {
  totalUsers: number;
  verifiedUsers: number;
  usersWithAddress: number;
  recentUsers: number;
}

export function UsersStats({
  totalUsers,
  verifiedUsers,
  usersWithAddress,
  recentUsers,
}: UsersStatsProps) {
  const stats = [
    {
      title: 'Tổng người dùng',
      value: totalUsers,
      icon: Users,
      description: 'Quản trị & Người dùng',
      percentage: '+12.5%',
      trend: 'up',
    },
    {
      title: 'Đã xác minh',
      value: verifiedUsers,
      icon: MailCheck,
      description: 'Đã xác minh email',
      percentage: '+4.2%',
      trend: 'up',
    },
    {
      title: 'Địa chỉ hoạt động',
      value: usersWithAddress,
      icon: MapPin,
      description: 'Người dùng có địa chỉ',
      percentage: '+2.1%',
      trend: 'up',
    },
    {
      title: 'Người dùng mới',
      value: recentUsers,
      icon: UserCheck,
      description: 'Đăng ký tuần này',
      percentage: '+10.3%',
      trend: 'up',
    },
  ];

  return (
    <AdminStatsGrid>
      {stats.map((stat, index) => (
        <AdminStatCard
          key={index}
          title={stat.title}
          value={stat.value.toLocaleString()}
          description={stat.description}
          icon={stat.icon}
          accent={index === 0 ? 'brand' : index === 1 ? 'blue' : 'green'}
          meta={
            <span className="inline-flex rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
              {stat.percentage}
            </span>
          }
        />
      ))}
    </AdminStatsGrid>
  );
}
