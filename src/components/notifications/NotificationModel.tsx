'use client';
import { X, Bell } from 'lucide-react';
import { useAppSelector } from '@/hooks/redux';
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  useClearAllNotifications,
  useUnreadNotificationCount,
} from '@/hooks/queries/useNotifications';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import NotificationItem from './NotificationItem';

export default function NotificationModel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const shouldFetchNotifications = isAuthenticated && isOpen;
  const { data, isLoading } = useNotifications(
    { page: 1, limit: 10 },
    { enabled: shouldFetchNotifications },
  );
  const { data: unreadCountData } = useUnreadNotificationCount({
    enabled: shouldFetchNotifications,
  });
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const clearAllMutation = useClearAllNotifications();

  const notifications = data?.notifications || [];
  const unreadCount = unreadCountData ?? data?.unreadCount ?? 0;

  if (!isOpen || !isAuthenticated) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="fixed right-4 top-14 left-auto z-[70] flex max-h-[75vh] w-[340px] translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-xl border-0 p-0 shadow-lg data-[state=open]:slide-in-from-top-2 sm:max-w-none"
      >
        <div className="flex items-center justify-between bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-sm font-medium">Thông báo</DialogTitle>
            {unreadCount > 0 && (
              <Badge variant="default" className="min-w-[18px] justify-center px-1.5 py-0 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </div>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Đóng thông báo"
              className="rounded-lg p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </DialogClose>
        </div>

        <div className="flex-1 overflow-y-auto" aria-live="polite">
          {isLoading && notifications.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <SpinnerLoading />
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map((noti) => (
                <NotificationItem key={noti._id} notification={noti} onClose={onClose} />
              ))}
            </div>
          ) : (
            <div className="py-16 px-6 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">Chưa có thông báo nào</p>
            </div>
          )}
        </div>

        {/* Footer - subtle actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between bg-muted/50 px-4 py-2.5">
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || unreadCount === 0}
              className="text-xs text-muted-foreground hover:text-foreground/80 disabled:opacity-50 transition-colors"
            >
              Đánh dấu đã đọc
            </button>
            <button
              onClick={() => clearAllMutation.mutate()}
              disabled={clearAllMutation.isPending}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
