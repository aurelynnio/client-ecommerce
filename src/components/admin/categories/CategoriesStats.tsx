import { Folder, Layers, Package } from "lucide-react";
import {
  AdminStatCard,
  AdminStatsGrid,
} from "@/components/admin/shared/AdminPrimitives";

interface CategoriesStatsProps {
  totalCategories: number;
  activeCategories: number;
  childCategories: number;
  totalProducts: number;
}

export function CategoriesStats({
  totalCategories,
  activeCategories,
  childCategories,
  totalProducts,
}: CategoriesStatsProps) {
  const stats = [
    {
      title: "Tổng Danh mục",
      value: totalCategories,
      description: "Tất cả danh mục trong hệ thống",
      icon: Folder,
    },
    {
      title: "Danh mục Hoạt động",
      value: activeCategories,
      description: "Danh mục đang hiển thị",
      icon: Folder,
    },
    {
      title: "Danh mục Con",
      value: childCategories,
      description: "Danh mục cấp 2, 3",
      icon: Layers,
    },
    {
      title: "Tổng Sản phẩm",
      value: totalProducts,
      description: "Sản phẩm trong các danh mục",
      icon: Package,
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
          accent={index === 2 ? "blue" : index === 3 ? "green" : "brand"}
        />
      ))}
    </AdminStatsGrid>
  );
}
