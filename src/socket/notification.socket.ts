import { Socket } from 'socket.io-client';
import { QueryClient } from '@tanstack/react-query';
import { notificationKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export const handleNotificationEvents = (socket: Socket, queryClient: QueryClient) => {
  if (!socket) return;

  socket.on('new_notification', (notification) => {
    const title = typeof notification.title === 'string' ? notification.title : 'Notification';
    const message = typeof notification.message === 'string' ? notification.message : '';

    toast.message(title, {
      description: message,
    });

    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  });

  socket.on('unread_count', (count) => {
    queryClient.setQueryData(notificationKeys.unreadCount(), count);
  });
};
