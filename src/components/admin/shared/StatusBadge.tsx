import { Badge, type BadgeProps } from '@/components/ui/badge';
import { CheckCircle, Clock, Shield, Store, Truck, XCircle } from 'lucide-react';
import type { ComponentType } from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'product' | 'user' | 'role';
  className?: string;
}

type StatusDefinition = {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  variant: NonNullable<BadgeProps['variant']>;
};

const STATUS_LABELS: Record<
  NonNullable<StatusBadgeProps['type']>,
  Record<string, StatusDefinition>
> = {
  order: {
    delivered: { icon: CheckCircle, label: 'Đã giao', variant: 'success' },
    shipped: { icon: Truck, label: 'Đang giao', variant: 'info' },
    processing: { icon: Clock, label: 'Đang xử lý', variant: 'warning' },
    pending: { icon: Clock, label: 'Chờ xử lý', variant: 'secondary' },
    cancelled: { icon: XCircle, label: 'Đã hủy', variant: 'destructive' },
  },
  product: {
    active: { label: 'Đang bán', variant: 'success' },
    out_of_stock: { label: 'Hết hàng', variant: 'destructive' },
    inactive: { label: 'Ngừng bán', variant: 'secondary' },
  },
  user: {
    active: { label: 'Đang hoạt động', variant: 'success' },
    inactive: { label: 'Ngừng hoạt động', variant: 'secondary' },
    banned: { label: 'Bị khóa', variant: 'destructive' },
  },
  role: {
    admin: { icon: Shield, label: 'Quản trị viên', variant: 'info' },
    customer: { label: 'Khách hàng', variant: 'secondary' },
    vendor: { icon: Store, label: 'Người bán', variant: 'info' },
  },
};

const FALLBACK_STATUS: StatusDefinition = { label: 'Không xác định', variant: 'outline' };

export default function StatusBadge({ status, type = 'order', className }: StatusBadgeProps) {
  const definition = STATUS_LABELS[type][status] ?? FALLBACK_STATUS;
  const Icon = definition.icon;

  return (
    <Badge variant={definition.variant} className={className}>
      {Icon ? <Icon className="mr-1 size-3" aria-hidden="true" /> : null}
      {definition.label}
    </Badge>
  );
}
