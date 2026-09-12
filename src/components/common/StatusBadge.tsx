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
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Clock,
  },
  processing: {
    label: 'Đang xử lý',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: Clock,
  },
  confirmed: {
    label: 'Đã xác nhận',
    className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    icon: CheckCircle2,
  },
  shipping: {
    label: 'Đang giao hàng',
    className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    icon: Truck,
  },
  delivered: {
    label: 'Đã giao hàng',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: PackageCheck,
  },
  completed: {
    label: 'Hoàn thành',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    icon: XCircle,
  },
  refunded: {
    label: 'Đã hoàn tiền',
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    icon: RotateCcw,
  },

  // Payment
  paid: {
    label: 'Đã thanh toán',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },
  unpaid: {
    label: 'Chưa thanh toán',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: AlertCircle,
  },
  payment_failed: {
    label: 'Thanh toán thất bại',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    icon: XCircle,
  },

  // Stock
  in_stock: {
    label: 'Còn hàng',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  low_stock: {
    label: 'Sắp hết hàng',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  out_of_stock: {
    label: 'Hết hàng',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },

  // Status
  active: {
    label: 'Hoạt động',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  inactive: {
    label: 'Tạm ẩn',
    className: 'bg-muted text-muted-foreground border-border',
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
    className: 'bg-muted text-muted-foreground border-border',
  };

  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <Badge
      variant="outline"
      className={cn('inline-flex items-center gap-1.5 font-medium', config.className, className)}
    >
      {showIcon && Icon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{displayLabel}</span>
    </Badge>
  );
}
