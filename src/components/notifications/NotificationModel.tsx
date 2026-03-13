"use client";
import { useEffect } from "react";
import { X, Bell } from "lucide-react";
import { useAppSelector } from "@/hooks/hooks";
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  useClearAllNotifications,
  useUnreadNotificationCount,
} from "@/hooks/queries/useNotifications";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import NotificationItem from "./NotificationItem";

export default function NotificationModel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data, isLoading } = useNotifications({ page: 1, limit: 10 });
  const { data: unreadCountData } = useUnreadNotificationCount();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const clearAllMutation = useClearAllNotifications();

  const notifications = data?.notifications || [];
  const unreadCount = unreadCountData ?? data?.unreadCount ?? 0;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !isAuthenticated) return null;

  return (
    <>
      {/* Backdrop - subtle */}
      <div className="fixed inset-0 z-60 bg-black/5" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-4 top-14 w-[340px] max-h-[75vh] flex flex-col bg-white z-70 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header - clean, minimal */}
        <div className="px-4 py-3 flex justify-between items-center bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">Thông báo</span>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <SpinnerLoading />
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map((noti) => (
                <NotificationItem
                  key={noti._id}
                  notification={noti}
                  onClose={onClose}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 px-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Chưa có thông báo nào</p>
            </div>
          )}
        </div>

        {/* Footer - subtle actions */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 bg-[#fafafa] flex justify-between items-center">
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || unreadCount === 0}
              className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
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
      </div>
    </>
  );
}
