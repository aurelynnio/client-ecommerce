"use client";

import { useState } from "react";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useClearAllNotifications,
  useCreateNotification,
} from "@/hooks/queries/useNotifications";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { NotificationsHeader } from "@/components/admin/notifications/NotificationsHeader";
import {
  CreateNotificationModal,
  CreateNotificationForm,
} from "@/components/admin/notifications/CreateNotificationModal";
import SpinnerLoading from "@/components/common/SpinnerLoading";

export default function AdminNotificationsPage() {
  const { data, isLoading } = useNotifications({ page: 1, limit: 50 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const clearAllMutation = useClearAllNotifications();
  const createMutation = useCreateNotification();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const notifications = data?.notifications || [];
  const pagination = data?.pagination;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to update all");
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      try {
        await clearAllMutation.mutateAsync();
        toast.success("All notifications cleared");
      } catch {
        toast.error("Failed to clear notifications");
      }
    }
  };

  const handleCreateNotification = async (formData: CreateNotificationForm) => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Notification sent successfully");
      setCreateModalOpen(false);
    } catch {
      toast.error("Failed to send notification");
    }
  };

  const isCreating = createMutation.isPending;

  const getIcon = (type: string) => {
    switch (type) {
      case "order_status":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "system":
        return <Bell className="h-5 w-5 text-orange-500" />;
      case "promotion":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 p-1">
      <NotificationsHeader
        onOpenCreate={() => setCreateModalOpen(true)}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAll}
      />

      <div className="rounded-2xl bg-white overflow-hidden min-h-[500px] flex flex-col">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center flex-1">
            <SpinnerLoading size={32} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-4">
            <Bell className="h-12 w-12 opacity-20" />
            <p>No notifications found</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "group relative flex gap-4 rounded-xl p-4 transition-all hover:bg-[#f7f7f7]",
                    !notification.isRead && "bg-red-50"
                  )}
                >
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7f7f7]">
                    {getIcon(notification.type || "system")}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p
                        className={cn(
                          "text-sm font-medium leading-none",
                          !notification.isRead && "text-[#E53935]"
                        )}
                      >
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {notification.createdAt
                          ? formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )
                          : ""}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs hover:bg-red-100 hover:text-[#E53935]"
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>

                  {!notification.isRead && (
                    <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#E53935]" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {pagination && (
          <div className="p-4 bg-[#f7f7f7] text-center text-xs text-muted-foreground">
            Showing {notifications.length} of {pagination.totalItems}{" "}
            notifications
          </div>
        )}
      </div>

      <CreateNotificationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={handleCreateNotification}
        isLoading={isCreating}
      />
    </div>
  );
}
