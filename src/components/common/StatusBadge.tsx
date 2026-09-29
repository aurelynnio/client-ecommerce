'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';

export type StatusType =
  // Orders
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  // Payment
  | 'paid'
  | 'unpaid'
  | 'payment_failed'
  // Inventory
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  // General / Custom
  | 'active'
  | 'inactive'
  | string;

interface StatusConfig {
  label: string;
  className: string;
  icon?: LucideIcon;
}

const statusMap: Record<string, StatusConfig> = {
  // Orders
  pending: {
    label: 'Chờ xử lý',
    className: 'bg-warning/15 text-warning',
    icon: Clock,
  },
  processing: {
    label: 'Đang xử lý',
    className: 'bg-info/15 text-info',
    icon: Clock,
  },
  confirmed: {
    label: 'Đã xác nhận',
    className: 'bg-info/15 text-info',
    icon: CheckCircle2,
  },
  shipping: {
    label: 'Đang giao hàng',
    className: 'bg-info/15 text-info',
    icon: Truck,
  },
  delivered: {
    label: 'Đã giao hàng',
    className: 'bg-success/15 text-success',
    icon: PackageCheck,
  },
  completed: {
    label: 'Hoàn thành',
    className: 'bg-success/15 text-success',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-destructive/15 text-destructive',
    icon: XCircle,
  },
  refunded: {
    label: 'Đã hoàn tiền',
    className: 'bg-muted text-muted-foreground',
    icon: RotateCcw,
  },

  // Payment
  paid: {
    label: 'Đã thanh toán',
    className: 'bg-success/15 text-success',
    icon: CheckCircle2,
  },
  unpaid: {
    label: 'Chưa thanh toán',
    className: 'bg-warning/15 text-warning',
    icon: AlertCircle,
  },
  payment_failed: {
    label: 'Thanh toán thất bại',
    className: 'bg-destructive/15 text-destructive',
    icon: XCircle,
  },

  // Stock
  in_stock: {
    label: 'Còn hàng',
    className: 'bg-success/15 text-success',
  },
  low_stock: {
    label: 'Sắp hết hàng',
    className: 'bg-warning/15 text-warning',
  },
  out_of_stock: {
    label: 'Hết hàng',
    className: 'bg-destructive/15 text-destructive',
  },

  // Status
  active: {
    label: 'Hoạt động',
    className: 'bg-success/15 text-success',
  },
  inactive: {
    label: 'Tạm ẩn',
    className: 'bg-muted text-muted-foreground',
  },
};

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const normalizedKey = status?.toLowerCase()?.replace(/\s+/g, '_');
  const config = statusMap[normalizedKey] || {
    label: label || status,
    className: 'bg-muted text-muted-foreground',
  };

  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <Badge
      variant="outline"
      className={cn('inline-flex items-center gap-1.5 font-medium border-0', config.className, className)}
    >
      {showIcon && Icon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{displayLabel}</span>
    </Badge>
  );
}
