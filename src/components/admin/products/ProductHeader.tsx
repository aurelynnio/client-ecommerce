import { Download, RefreshCw } from 'lucide-react';
import { AdminActionButton, AdminPageHeader } from '@/components/admin/shared/AdminPrimitives';

interface ProductsHeaderProps {
  onRefresh?: () => void;
  onExport?: () => void;
}

export function ProductsHeader({ onRefresh, onExport }: ProductsHeaderProps) {
  return (
    <AdminPageHeader
      title="Quản lý Sản phẩm"
      description="Xem, rà soát và điều phối danh mục sản phẩm đến từ các shop trên sàn."
      actions={
        <>
          {onRefresh ? (
            <AdminActionButton onClick={onRefresh} tone="secondary">
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </AdminActionButton>
          ) : null}
          {onExport ? (
            <AdminActionButton onClick={onExport} tone="secondary">
              <Download className="h-4 w-4" />
              Xuất Excel
            </AdminActionButton>
          ) : null}
        </>
      }
    />
  );
}
