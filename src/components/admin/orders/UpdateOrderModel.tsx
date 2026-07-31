import { useState } from 'react';
import { Order } from '@/types/order';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  adminDialogContentClass,
  adminFieldSurfaceClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from '@/components/admin/shared/AdminPrimitives';
import { cn } from '@/utils/cn';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: { status: string }) => void;
  order: Order | null;
  isLoading: boolean;
}

export function EditOrderModal({ isOpen, onClose, onSave, order, isLoading }: EditOrderModalProps) {
  const [status, setStatus] = useState(order?.status ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ status });
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(adminDialogContentClass, 'sm:max-w-[420px] p-6')}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Cập nhật trạng thái đơn hàng
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Trạng thái đơn hàng
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger
                className={cn(adminFieldSurfaceClass, 'transition-colors focus:bg-card')}
              >
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-border">
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="shipped">Đang giao</SelectItem>
                <SelectItem value="delivered">Đã giao</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={cn('sm:min-w-28', adminSecondaryButtonClass)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn('sm:min-w-36', adminPrimaryButtonClass)}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
