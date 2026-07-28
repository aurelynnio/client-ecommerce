import { Plus } from 'lucide-react';
import { AdminActionButton, AdminPageHeader } from '@/components/admin/shared/AdminPrimitives';

interface NotificationsHeaderProps {
  onOpenCreate: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export function NotificationsHeader({
  onOpenCreate,
  onMarkAllRead,
  onClearAll,
}: NotificationsHeaderProps) {
  return (
    <AdminPageHeader
      title="Thông báo"
      description="Quản lý luồng cảnh báo, cập nhật hệ thống và thông điệp gửi tới người dùng."
      actions={
        <>
          <AdminActionButton tone="secondary" onClick={onMarkAllRead}>
            Đánh dấu đã đọc
          </AdminActionButton>
          <AdminActionButton tone="danger" onClick={onClearAll}>
            Xóa tất cả
          </AdminActionButton>
          <AdminActionButton onClick={onOpenCreate}>
            <Plus className="h-4 w-4" />
            Tạo thông báo
          </AdminActionButton>
        </>
      }
    />
  );
}
