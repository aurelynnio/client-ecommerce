import { Plus } from 'lucide-react';
import { AdminActionButton, AdminPageHeader } from '@/components/admin/shared/AdminPrimitives';

interface BannersHeaderProps {
  onAddBanner: () => void;
}

export function BannersHeader({ onAddBanner }: BannersHeaderProps) {
  return (
    <AdminPageHeader
      title="Quản lý Banner"
      description="Điều phối hero, khuyến mãi và các điểm chạm thị giác của trang chủ."
      actions={
        <AdminActionButton onClick={onAddBanner}>
          <Plus className="h-4 w-4" />
          Thêm Banner
        </AdminActionButton>
      }
    />
  );
}
