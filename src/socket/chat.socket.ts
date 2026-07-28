import { Socket } from 'socket.io-client';
import { QueryClient } from '@tanstack/react-query';
import { chatKeys } from '@/lib/queryKeys';
import { Message } from '@/types/chat';

/**
 * Sets up chat event listeners on the socket connection.
 * Listens for new_message events and synchronizes React Query cache.
 *
 * @param socket - The socket.io client socket instance
 * @param queryClient - React Query client for cache sync
 *
 */
export const handleChatEvents = (socket: Socket, queryClient: QueryClient): void => {
  if (!socket) return;

  socket.on('new_message', (message: Message) => {
    queryClient.setQueryData(
      chatKeys.messages(message.conversation),
      (previous: { messages: Message[]; pagination: unknown | null } | undefined) => {
        if (!previous) return previous;
        const exists = previous.messages.some((m) => m._id === message._id);
        if (exists) return previous;
        return {
          ...previous,
          messages: [...previous.messages, message],
        };
      },
    );

    queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
  });
};

/**
 * Joins a conversation room to receive real-time messages.
 * Emits join_conversation event to the server.
 *
 * @param socket - The socket.io client socket instance
 * @param conversationId - The ID of the conversation to join
 *
 */
export const joinConversation = (socket: Socket, conversationId: string): void => {
  if (!socket || !conversationId) return;

  socket.emit('join_conversation', conversationId);
};

/**
 * Leaves a conversation room to stop receiving real-time messages.
 * Emits leave_conversation event to the server.
 *
 * @param socket - The socket.io client socket instance
 * @param conversationId - The ID of the conversation to leave
 *
 */
export const leaveConversation = (socket: Socket, conversationId: string): void => {
  if (!socket || !conversationId) return;

  socket.emit('leave_conversation', conversationId);
};
