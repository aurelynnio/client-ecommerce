import { Socket } from 'socket.io-client';
import { QueryClient } from '@tanstack/react-query';
import { handleNotificationEvents } from './notification.socket';
import { handleChatEvents } from './chat.socket';

export const initSocketEvents = (socket: Socket, queryClient: QueryClient) => {
  handleNotificationEvents(socket, queryClient);
  handleChatEvents(socket, queryClient);
};
