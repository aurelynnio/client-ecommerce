'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { MessageSquare, Search, Send, User, Image as ImageIcon, Paperclip, X } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMyShop } from '@/hooks/queries';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/hooks/hooks';
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

export default function SellerChatPage() {
  const { data: myShop } = useMyShop();
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
  const [searchTerm, setSearchTerm] = useState('');
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

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!myShop) return null;

  return (
    <section className="min-h-[70vh] overflow-hidden rounded-lg border border-border bg-card lg:h-[calc(100dvh-11rem)]">
      <div className="flex h-full flex-col lg:flex-row">
        <div className="flex w-full flex-col border-b border-border bg-card lg:w-80 lg:border-b-0 lg:border-r">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Tin nhắn</h2>
                <p className="text-xs text-muted-foreground">
                  {conversations.length} cuộc hội thoại
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 rounded-lg bg-muted/40 pl-10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center h-32">
                <SpinnerLoading noWrapper size={24} className="text-info" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm text-center">Chưa có tin nhắn nào</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation._id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={cn(
                    'flex w-full items-center gap-3 border-t border-border p-4 text-left transition-colors hover:bg-muted/60',
                    currentConversation?._id === conversation._id && 'bg-primary/10',
                  )}
                >
                  <div className="relative">
                    <div className="size-12 overflow-hidden rounded-full bg-muted">
                      {conversation.user.avatar ? (
                        <Image
                          src={conversation.user.avatar}
                          alt={conversation.user.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="truncate font-medium text-foreground">
                        {conversation.user.name}
                      </p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="truncate text-sm text-muted-foreground">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-muted/30">
          {currentConversation ? (
            <>
              <div className="flex flex-col gap-3 border-b border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 overflow-hidden rounded-full bg-muted">
                    {currentConversation.user.avatar ? (
                      <Image
                        src={currentConversation.user.avatar}
                        alt={currentConversation.user.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{currentConversation.user.name}</p>
                    <p className="text-xs text-muted-foreground">Khách hàng của shop</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <SpinnerLoading noWrapper size={24} className="text-info" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
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
                          'max-w-[70%] rounded-lg px-4 py-2.5',
                          message.sender === user?._id
                            ? 'rounded-br-md bg-primary text-primary-foreground'
                            : 'rounded-bl-md border border-border bg-card text-foreground',
                        )}
                      >
                        <ChatAttachments
                          attachments={message.attachments}
                          isOwnMessage={message.sender === user?._id}
                        />
                        {message.content ? <p className="text-sm">{message.content}</p> : null}
                        <p
                          className={cn(
                            'text-[10px] mt-1',
                            message.sender === user?._id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground',
                          )}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-border bg-card p-4">
                {selectedFiles.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-foreground"
                      >
                        <span className="max-w-[220px] truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          aria-label={`Bỏ tệp ${file.name}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-lg shrink-0"
                    onClick={() => imageInputRef.current?.click()}
                    aria-label="Đính kèm ảnh"
                  >
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-lg shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Đính kèm tệp"
                  >
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void handleSendMessage()}
                    className="h-10 min-w-[200px] flex-1 rounded-lg bg-muted/40"
                    disabled={isSending}
                  />
                  <Button
                    onClick={() => void handleSendMessage()}
                    disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending}
                    className="h-10 rounded-lg bg-primary px-4 hover:bg-primary-hover"
                  >
                    {isSending ? (
                      <SpinnerLoading noWrapper size={16} className="text-white" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
              <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-10 w-10 opacity-50" />
              </div>
              <p className="text-lg font-medium text-foreground">Chọn một cuộc hội thoại</p>
              <p className="text-sm mt-1">Chọn từ danh sách bên trái để bắt đầu chat</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
