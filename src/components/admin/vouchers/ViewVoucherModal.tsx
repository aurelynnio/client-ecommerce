import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Voucher } from '@/types/voucher';
import { Edit, Calendar, DollarSign, BarChart3, Clock, Tag } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/format';
import {
  adminDialogContentClass,
  adminDialogFooterClass,
  adminInsetPanelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from '@/components/admin/shared/AdminPrimitives';

interface ViewModelDiscountProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: Voucher | null;
  onEdit: (discount: Voucher) => void;
}

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export function ViewModelDiscount({
  open,
  onOpenChange,
  discount,
  onEdit,
}: ViewModelDiscountProps) {
  if (!discount) return null;

  const statusConfig = {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      label: 'Đang hoạt động',
    },
    expired: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      label: 'Đã hết hạn',
    },
    limit: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      label: 'Hết lượt dùng',
    },
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      label: 'Ngừng hoạt động',
    },
  };

  const getStatus = () => {
    const usedCount = discount.usageCount ?? 0;
    if (!discount.isActive) return statusConfig.inactive;
    if (new Date(discount.endDate) < new Date()) return statusConfig.expired;
    if (usedCount >= discount.usageLimit) return statusConfig.limit;
    return statusConfig.active;
  };

  const status = getStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(adminDialogContentClass, 'sm:max-w-[550px] p-0 overflow-hidden')}
      >
        <DialogHeader className="p-6 pb-2 border-b border-border/50">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {discount.code}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground flex items-center gap-2">
                Chi tiết mã giảm giá
              </DialogDescription>
            </div>
            <div
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border border-transparent',
                status.bg,
                status.text,
              )}
            >
              {status.label}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className={cn(adminInsetPanelClass, 'p-4 space-y-2')}>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Loại
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {discount.type === 'percentage' ? 'Phần trăm' : 'Cố định'}
              </div>
              <div className="text-sm text-muted-foreground">Loại giảm giá áp dụng</div>
            </div>

            <div className={cn(adminInsetPanelClass, 'p-4 space-y-2')}>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Giá trị
              </div>
              <div className="text-2xl font-bold tracking-tight text-blue-600">
                {discount.type === 'percentage'
                  ? `${discount.value ?? 0}%`
                  : `${(discount.value ?? 0).toLocaleString()}₫`}
              </div>
              <div className="text-sm text-muted-foreground">Số tiền được giảm</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">
              Sử dụng & Giới hạn
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={cn(adminInsetPanelClass, 'flex items-center gap-3 p-3 shadow-none')}>
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {discount.usageCount ?? 0} / {discount.usageLimit}
                  </div>
                  <div className="text-xs text-muted-foreground">Tổng lượt sử dụng</div>
                </div>
              </div>

              <div className={cn(adminInsetPanelClass, 'flex items-center gap-3 p-3 shadow-none')}>
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {discount.minOrderValue?.toLocaleString() || 0} ₫
                  </div>
                  <div className="text-xs text-muted-foreground">Đơn hàng tối thiểu</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">
              Thời gian hiệu lực
            </h4>
            <div className={cn(adminInsetPanelClass, 'p-4 space-y-3')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Ngày bắt đầu</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDate(discount.startDate, DATE_TIME_OPTIONS)}
                </span>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Ngày kết thúc</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDate(discount.endDate, DATE_TIME_OPTIONS)}
                </span>
              </div>
            </div>
          </div>

          {discount.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">
                Mô tả
              </h4>
              <div className={cn(adminInsetPanelClass, 'rounded-xl p-3 text-sm')}>
                {discount.description}
              </div>
            </div>
          )}

          {/* Products Info */}
        </div>

        <DialogFooter className={cn(adminDialogFooterClass, 'border-t-0 px-6 pt-0 pb-6')}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={cn('sm:min-w-28', adminSecondaryButtonClass)}
          >
            Đóng
          </Button>
          <Button
            onClick={() => onEdit(discount)}
            className={cn('gap-2 sm:min-w-40', adminPrimaryButtonClass)}
          >
            <Edit className="h-4 w-4" />
            Sửa mã giảm giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
