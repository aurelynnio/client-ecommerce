import { Notification } from "@/types/notification";
import { ShoppingBag, Tag, Info, Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

export default function NotificationItem({
  notification,
  onClose,
}: NotificationItemProps) {
  const timeAgo = (dateRequest: string) => {
    const date = new Date(dateRequest);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return "Vừa xong";
  };

  const getIcon = () => {
    const iconClass = "h-4 w-4";
    switch (notification.type) {
      case "order_status":
        return <ShoppingBag className={cn(iconClass, "text-blue-500")} />;
      case "promotion":
        return <Tag className={cn(iconClass, "text-green-500")} />;
      case "system":
        return <Info className={cn(iconClass, "text-amber-500")} />;
      default:
        return <Bell className={cn(iconClass, "text-gray-400")} />;
    }
  };

  const Content = (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50/80",
        !notification.isRead && "bg-primary/3",
      )}
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-[13px] leading-snug line-clamp-1",
              !notification.isRead
                ? "font-medium text-gray-800"
                : "text-gray-700",
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
          {notification.message}
        </p>

        <p className="text-[11px] text-gray-400 mt-1.5">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link
        href={notification.link}
        onClick={onClose}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {Content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClose}
      className="block w-full cursor-pointer rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      {Content}
    </button>
  );
}
