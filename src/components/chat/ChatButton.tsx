'use client';
import { MessageCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { toggleChat } from '@/features/chat/chatSlice';
import { useChatConversations } from '@/hooks/queries';

export default function ChatButton() {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector((state) => state.chat);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: conversations = [] } = useChatConversations({
    enabled: isAuthenticated,
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={() => dispatch(toggleChat())}
      aria-label={isOpen ? 'Đóng trò chuyện' : 'Mở trò chuyện'}
      aria-expanded={isOpen}
      className={`fixed bottom-4 right-4 z-40 flex size-14 items-center justify-center rounded-full border border-border shadow-lg transition-colors ${
        isOpen
          ? 'bg-muted text-muted-foreground'
          : 'bg-primary text-primary-foreground hover:bg-primary-hover'
      }`}
    >
      <MessageCircle className="h-6 w-6" />
      {totalUnread > 0 && !isOpen && (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-warning text-xs font-bold text-warning-foreground">
          {totalUnread > 9 ? '9+' : totalUnread}
        </span>
      )}
    </button>
  );
}
