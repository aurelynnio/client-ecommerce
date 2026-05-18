"use client";
import { useState } from "react";

import { PaginationControls } from "@/components/common/Pagination";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import {
  useAdminChatbotSessions,
  useAdminChatbotHistory,
  type ChatSession,
  type ChatMessage,
} from "@/hooks/queries";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/utils/cn";

export default function AdminChatbotPage() {
  const { filters, updateFilter } = useUrlFilters({
    defaultFilters: { page: 1, limit: 10 },
    basePath: "/admin/chatbot",
  });
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;

  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data, isLoading } = useAdminChatbotSessions({
    page,
    limit,
  });

  const { data: historyData, isLoading: historyLoading } =
    useAdminChatbotHistory(selectedSession);

  const sessions = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Chatbot AI</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <SpinnerLoading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Session ID</th>
                <th className="px-6 py-4">Tin nhắn cuối</th>
                <th className="px-6 py-4">Số tin nhắn</th>
                <th className="px-6 py-4">Cập nhật lúc</th>
                <th className="px-6 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    Không tìm thấy phiên chat nào
                  </td>
                </tr>
              ) : (
                sessions.map((session: ChatSession) => (
                  <tr key={session.sessionId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {session.sessionId}
                    </td>
                    <td className="px-6 py-4">
                      <p className="line-clamp-2 max-w-[300px] text-gray-800">
                        {session.lastMessage}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {session.messageCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(new Date(session.updatedAt), "HH:mm dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedSession(session.sessionId)}
                        className="text-[#E53935] hover:underline font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && (
        <div className="flex justify-center mt-6">
          <PaginationControls
            pagination={pagination}
            onPageChange={(p) => updateFilter("page", p)}
            itemName="phiên chat"
          />
        </div>
      )}

      {/* Chat History Modal */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Lịch sử hội thoại</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {historyLoading ? (
              <div className="flex justify-center py-10">
                <SpinnerLoading />
              </div>
            ) : (
              historyData?.messages?.map((msg: ChatMessage, idx: number) => (
                <div
                  key={idx}
                  className={cn(
                    "flex w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                      msg.role === "user"
                        ? "bg-[#E53935] text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                    )}
                  >
                    <p>{msg.content?.trim() || "[Tin nhắn trống]"}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1 text-right",
                        msg.role === "user" ? "text-white/70" : "text-gray-400"
                      )}
                    >
                      {format(new Date(msg.timestamp), "HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
