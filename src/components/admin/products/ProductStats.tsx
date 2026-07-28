import { Package, Tag, DollarSign, BarChart3 } from 'lucide-react';
import { AdminStatCard, AdminStatsGrid } from '@/components/admin/shared/AdminPrimitives';

interface ProductsStatsProps {
  totalProducts: number;
  activeProducts: number;
  productsOnSale: number;
  totalCategories: number;
}

export function ProductsStats({
  totalProducts,
  activeProducts,
  productsOnSale,
  totalCategories,
}: ProductsStatsProps) {
  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: totalProducts,
      icon: Package,
      description: 'Tất cả sản phẩm',
    },
    {
      title: 'Đang bán',
      value: activeProducts,
      icon: BarChart3,
      description: 'Sản phẩm đang hoạt động',
    },
    {
      title: 'Khuyến mãi',
      value: productsOnSale,
      icon: DollarSign,
      description: 'Sản phẩm đang giảm giá',
    },
    {
      title: 'Danh mục',
      value: totalCategories,
      icon: Tag,
      description: 'Tổng số danh mục',
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
          accent={index === 1 ? 'green' : index === 2 ? 'amber' : 'brand'}
        />
      ))}
    </AdminStatsGrid>
  );
}
