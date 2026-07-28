import { Plus } from 'lucide-react';
import { AdminActionButton, AdminPageHeader } from '@/components/admin/shared/AdminPrimitives';

interface UsersHeaderProps {
  onOpenCreate: () => void;
}

export function UsersHeader({ onOpenCreate }: UsersHeaderProps) {
  return (
    <AdminPageHeader
      title="Quản lý Người dùng"
      description="Quản trị tài khoản, vai trò và trạng thái xác minh của toàn bộ người dùng."
      actions={
        <AdminActionButton onClick={onOpenCreate}>
          <Plus className="h-4 w-4" />
          Thêm Người dùng
        </AdminActionButton>
      }
    />
  );
}
