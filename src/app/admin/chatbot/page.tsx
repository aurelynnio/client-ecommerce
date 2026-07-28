'use client';
import { useState } from 'react';

import { PaginationControls } from '@/components/common/Pagination';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import {
  useAdminChatbotSessions,
  useAdminChatbotHistory,
  type ChatSession,
  type ChatMessage,
} from '@/hooks/queries';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AdminPageHeader,
  adminRowHoverClass,
  adminTableHeaderClass,
  adminTableShellClass,
} from '@/components/admin/shared/AdminPrimitives';
import { cn } from '@/utils/cn';

export default function AdminChatbotPage() {
  const { filters, updateFilter } = useUrlFilters({
    defaultFilters: { page: 1, limit: 10 },
    basePath: '/admin/chatbot',
  });
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;

  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data, isLoading } = useAdminChatbotSessions({
    page,
    limit,
  });

  const { data: historyData, isLoading: historyLoading } = useAdminChatbotHistory(selectedSession);

  const sessions = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 p-1">
      <AdminPageHeader
        title="Hội thoại Mia"
        description="Theo dõi các phiên hỗ trợ để kiểm tra chất lượng và ngữ cảnh phản hồi của trợ lý."
      />

      <div className={adminTableShellClass}>
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <SpinnerLoading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm text-left">
              <thead className={adminTableHeaderClass}>
                <tr>
                  <th className="px-6 py-4">Session ID</th>
                  <th className="px-6 py-4">Tin nhắn cuối</th>
                  <th className="px-6 py-4">Số tin nhắn</th>
                  <th className="px-6 py-4">Cập nhật lúc</th>
                  <th className="px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      Không tìm thấy phiên chat nào
                    </td>
                  </tr>
                ) : (
                  sessions.map((session: ChatSession) => (
                    <tr key={session.sessionId} className={adminRowHoverClass}>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {session.sessionId}
                      </td>
                      <td className="px-6 py-4">
                        <p className="line-clamp-2 max-w-[300px] text-foreground">
                          {session.lastMessage}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{session.messageCount}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(session.updatedAt), 'HH:mm dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="link"
                          onClick={() => setSelectedSession(session.sessionId)}
                          className="h-auto px-0 text-primary"
                        >
                          Xem chi tiết
                        </Button>
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
            onPageChange={(p) => updateFilter('page', p)}
            itemName="phiên chat"
          />
        </div>
      )}

      {/* Chat History Modal */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="flex h-[80dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border p-4">
            <DialogTitle>Lịch sử hội thoại</DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/50 p-4">
            {historyLoading ? (
              <div className="flex justify-center py-10">
                <SpinnerLoading />
              </div>
            ) : (
              historyData?.messages?.map((msg: ChatMessage, idx: number) => (
                <div
                  key={idx}
                  className={cn(
                    'flex w-full',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                      msg.role === 'user'
                        ? 'rounded-br-none bg-primary text-primary-foreground'
                        : 'rounded-bl-none border border-border bg-card text-card-foreground',
                    )}
                  >
                    <p>{msg.content?.trim() || '[Tin nhắn trống]'}</p>
                    <p
                      className={cn(
                        'text-[10px] mt-1 text-right',
                        msg.role === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground',
                      )}
                    >
                      {format(new Date(msg.timestamp), 'HH:mm')}
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
