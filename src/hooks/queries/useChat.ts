import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { extractApiData } from '@/api';
import { STALE_TIME } from '@/constants/cache';
import { chatKeys } from '@/lib/queryKeys';
import { errorHandler } from '@/services/errorHandler';
import {
  ChatPagination,
  Conversation,
  Message,
  SendMessagePayload,
  StartConversationPayload,
} from '@/types/chat';

export interface ChatMessagesParams {
  conversationId: string;
  page?: number;
  limit?: number;
}

export interface ChatMessagesResponse {
  messages: Message[];
  pagination: ChatPagination | null;
}

const chatApi = {
  startConversation: async (data: StartConversationPayload): Promise<Conversation> => {
    const response = await instance.post('/chat/start', data);
    return extractApiData(response);
  },

  getConversations: async (): Promise<Conversation[]> => {
    const response = await instance.get('/chat/conversations');
    return extractApiData(response);
  },

  getMessages: async (params: ChatMessagesParams): Promise<ChatMessagesResponse> => {
    const { conversationId, page = 1, limit = 50 } = params;
    const response = await instance.get(`/chat/messages/${conversationId}`, {
      params: { page, limit },
    });
    const data = extractApiData<
      | {
          data?: Message[];
          messages?: Message[];
          pagination?: ChatPagination;
        }
      | Message[]
    >(response);

    return {
      messages: Array.isArray(data) ? data : (data?.messages ?? data?.data ?? []),
      pagination: Array.isArray(data) ? null : (data?.pagination ?? null),
    };
  },

  sendMessage: async (data: SendMessagePayload): Promise<Message> => {
    const { files = [], ...payload } = data;

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('conversationId', payload.conversationId);
      formData.append('content', payload.content || '');
      if (payload.productRef) {
        formData.append('productRef', payload.productRef);
      }
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await instance.post('/chat/message/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractApiData(response);
    }

    const response = await instance.post('/chat/message', payload);
    return extractApiData(response);
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await instance.put(`/chat/conversations/${conversationId}/read`);
  },
};

function invalidateChatQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: chatKeys.all });
}

export function useChatConversations(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: chatApi.getConversations,
    enabled: options?.enabled,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useChatMessages(params: ChatMessagesParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: chatKeys.messages(params.conversationId),
    queryFn: () => chatApi.getMessages(params),
    enabled: options?.enabled ?? !!params.conversationId,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.startConversation,
    onSuccess: (conversation) => {
      queryClient.setQueryData(chatKeys.conversations(), (previous: Conversation[] = []) => {
        const exists = previous.some((c) => c._id === conversation._id);
        if (exists) {
          return previous.map((c) => (c._id === conversation._id ? conversation : c));
        }
        return [conversation, ...previous];
      });
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Start conversation failed' });
    },
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (message, variables) => {
      queryClient.setQueryData(
        chatKeys.messages(variables.conversationId),
        (previous: ChatMessagesResponse | undefined) => {
          if (!previous) {
            return { messages: [message], pagination: null };
          }
          const exists = previous.messages.some((m) => m._id === message._id);
          if (exists) return previous;
          return { ...previous, messages: [...previous.messages, message] };
        },
      );
      invalidateChatQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Send chat message failed' });
    },
  });
}

export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.markAsRead,
    onSuccess: (_, conversationId) => {
      queryClient.setQueryData(chatKeys.conversations(), (previous: Conversation[] = []) =>
        previous.map((conversation) =>
          conversation._id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
        ),
      );
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Mark conversation as read failed' });
    },
  });
}
