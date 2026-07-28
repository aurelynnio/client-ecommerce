import { Plus } from 'lucide-react';
import { AdminActionButton, AdminPageHeader } from '@/components/admin/shared/AdminPrimitives';

interface VouchersHeaderProps {
  onOpenCreate: () => void;
}

export function VouchersHeader({ onOpenCreate }: VouchersHeaderProps) {
  return (
    <AdminPageHeader
      title="Mã giảm giá"
      description="Quản lý vòng đời voucher, hiệu lực và hiệu suất sử dụng trên toàn hệ thống."
      actions={
        <AdminActionButton onClick={onOpenCreate}>
          <Plus className="h-4 w-4" />
          Tạo Mã giảm giá
        </AdminActionButton>
      }
    />
  );
}
