import { Plus } from "lucide-react";
import {
  AdminActionButton,
  AdminPageHeader,
} from "@/components/admin/shared/AdminPrimitives";

interface CategoriesHeaderProps {
  onAddCategory: () => void;
}

export function CategoriesHeader({ onAddCategory }: CategoriesHeaderProps) {
  return (
    <AdminPageHeader
      title="Quản lý Danh mục"
      description="Kiểm soát cấu trúc phân loại sản phẩm và hệ thống điều hướng catalog."
      actions={
        <AdminActionButton onClick={onAddCategory}>
          <Plus className="h-4 w-4" />
          Thêm Danh mục
        </AdminActionButton>
      }
    />
  );
}
