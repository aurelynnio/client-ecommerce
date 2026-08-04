'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageCircle,
  Send,
  Search,
  Image as ImageIcon,
  Paperclip,
  Store,
  ChevronLeft,
  X,
} from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/hooks/redux';
import {
  useChatConversations,
  useChatMessages,
  useSendChatMessage,
  useMarkConversationAsRead,
} from '@/hooks/queries';
import { Conversation } from '@/types/chat';
import { useSocket } from '@/context/SocketContext';
import { joinConversation, leaveConversation } from '@/socket/chat.socket';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '@/api';
import ChatAttachments from '@/components/chat/ChatAttachments';

export default function MessagesPage() {
  const { data: conversations = [], isLoading: isLoadingConversations } = useChatConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const activeConversationId = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.some((conversation) => conversation._id === selectedConversationId)
      ? selectedConversationId
      : null;
  }, [conversations, selectedConversationId]);
  const currentConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );
  const { data: messageData, isLoading: isLoadingMessages } = useChatMessages(
    { conversationId: activeConversationId ?? '' },
    { enabled: !!activeConversationId },
  );
  const messages = useMemo(() => messageData?.messages ?? [], [messageData?.messages]);

  const sendMessageMutation = useSendChatMessage();
  const markAsReadMutation = useMarkConversationAsRead();
  const isSending = sendMessageMutation.isPending;
  const { data: user } = useAppSelector((state) => state.auth);
  const { socket } = useSocket();

  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!socket || !activeConversationId) return;
    joinConversation(socket, activeConversationId);
    return () => {
      leaveConversation(socket, activeConversationId);
    };
  }, [socket, activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversationId(conversation._id);
    markAsReadMutation.mutate(conversation._id);
    setShowMobileChat(true);
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !currentConversation || isSending) {
      return;
    }
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: currentConversation._id,
        content: newMessage.trim(),
        files: selectedFiles,
      });
      setNewMessage('');
      setSelectedFiles([]);
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể gửi tin nhắn'));
    }
  };

  const appendFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    setSelectedFiles((prev) => {
      const next = [...prev, ...Array.from(fileList)];
      return next.slice(0, 5);
    });
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ`;
    return date.toLocaleDateString('vi-VN');
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.shop.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-background py-4">
      <div className="aura-container">
        <section className="grid h-[calc(100dvh-7rem)] overflow-hidden rounded-lg border border-border bg-card md:grid-cols-[18rem_minmax(0,1fr)]">
          <div
            className={cn(
              'flex min-h-0 w-full flex-col border-r border-border md:w-auto',
              showMobileChat && 'hidden md:flex',
            )}
          >
            <div className="border-b border-border p-4">
              <div className="mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold text-foreground">Tin nhắn</h1>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-lg border-border pl-9 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="flex h-32 items-center justify-center">
                  <SpinnerLoading size={24} />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                  <MessageCircle className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 border-b border-border p-3 transition-colors',
                      currentConversation?._id === conversation._id
                        ? 'bg-primary/10'
                        : 'hover:bg-muted/30',
                    )}
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={conversation.shop.avatar || '/images/placeholder-shop.svg'}
                        alt={conversation.shop.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium text-foreground">
                          {conversation.shop.name}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {conversation.lastMessage?.createdAt &&
                            formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {conversation.lastMessage?.content || 'Bắt đầu cuộc trò chuyện'}
                      </p>
                    </div>

                    {conversation.unreadCount > 0 && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={cn('min-h-0 flex-1 flex-col bg-card', !showMobileChat && 'hidden md:flex')}>
            {currentConversation ? (
              <>
                <div className="flex items-center gap-3 border-b border-border p-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="rounded-md p-1 transition-colors hover:bg-muted md:hidden"
                    aria-label="Quay lại"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="relative size-10 overflow-hidden rounded-full">
                    <Image
                      src={currentConversation.shop.avatar || '/images/placeholder-shop.svg'}
                      alt={currentConversation.shop.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-medium text-foreground">{currentConversation.shop.name}</h2>
                    <span className="text-xs text-muted-foreground">
                      Trò chuyện trực tiếp với cửa hàng
                    </span>
                  </div>
                  <Link href={`/shop/${currentConversation.shop.shopId}`}>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs">
                      <Store className="mr-1 h-3.5 w-3.5" />
                      Xem Shop
                    </Button>
                  </Link>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                  {isLoadingMessages ? (
                    <div className="flex flex-1 items-center justify-center">
                      <SpinnerLoading size={32} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                      <MessageCircle className="mb-2 h-8 w-8 opacity-50" />
                      <p className="text-sm">Bắt đầu cuộc trò chuyện</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={cn(
                          'flex',
                          message.sender === user?._id ? 'justify-end' : 'justify-start',
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-lg px-3 py-2 text-sm',
                            message.sender === user?._id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground',
                          )}
                        >
                          <ChatAttachments
                            attachments={message.attachments}
                            isOwnMessage={message.sender === user?._id}
                          />
                          {message.content ? <p>{message.content}</p> : null}
                          <span
                            className={cn(
                              'mt-1 block text-[10px]',
                              message.sender === user?._id
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground',
                            )}
                          >
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-border p-3">
                  {selectedFiles.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-foreground"
                        >
                          <span className="max-w-[180px] truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={`Xóa ${file.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => appendFiles(e.target.files)}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                      multiple
                      className="hidden"
                      onChange={(e) => appendFiles(e.target.files)}
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                      aria-label="Đính kèm hình ảnh"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                      aria-label="Đính kèm tệp"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && void handleSendMessage()}
                      className="flex-1 rounded-lg border-border focus:border-primary focus:ring-primary/20"
                      disabled={isSending}
                    />
                    <Button
                      onClick={() => void handleSendMessage()}
                      disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending}
                      className="shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
                    >
                      {isSending ? (
                        <SpinnerLoading size={16} noWrapper className="mr-2" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/30">
                    <MessageCircle className="h-8 w-8 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
