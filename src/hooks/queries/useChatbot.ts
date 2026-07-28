import { useQuery } from '@tanstack/react-query';
import instance from '@/api/api';
import { extractApiData } from '@/api';
import { chatbotKeys } from '@/lib/queryKeys';
import { PaginationData } from '@/types/common';

export interface ChatSession {
  sessionId: string;
  lastMessage: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AdminChatbotSessionsResponse {
  data: ChatSession[];
  pagination: PaginationData | null;
}

export interface AdminChatbotHistoryResponse {
  sessionId: string;
  messages: ChatMessage[];
}

const chatbotApi = {
  getAdminSessions: async (params: {
    page: number;
    limit: number;
  }): Promise<AdminChatbotSessionsResponse> => {
    const response = await instance.get('/chatbot/admin/sessions', { params });
    const data = extractApiData<{
      data?: ChatSession[];
      pagination?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
      };
    }>(response);

    const paginationRaw = data?.pagination;
    const currentPage = paginationRaw?.page || params.page;
    const pageSize = paginationRaw?.limit || params.limit;
    const totalItems = paginationRaw?.total || 0;
    const totalPages = paginationRaw?.totalPages || 1;

    return {
      data: data?.data || [],
      pagination: paginationRaw
        ? {
            currentPage,
            pageSize,
            totalPages,
            totalItems,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            nextPage: currentPage < totalPages ? currentPage + 1 : null,
            prevPage: currentPage > 1 ? currentPage - 1 : null,
          }
        : null,
    };
  },

  getHistory: async (sessionId: string): Promise<AdminChatbotHistoryResponse> => {
    const response = await instance.get(`/chatbot/history/${sessionId}`);
    return extractApiData(response);
  },
};

export function useAdminChatbotSessions(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: chatbotKeys.adminSessions(params),
    queryFn: () => chatbotApi.getAdminSessions(params),
  });
}

export function useAdminChatbotHistory(sessionId: string | null) {
  return useQuery({
    queryKey: chatbotKeys.history(sessionId ?? ''),
    queryFn: () => chatbotApi.getHistory(sessionId ?? ''),
    enabled: !!sessionId,
  });
}
