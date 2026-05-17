"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  Search,
  Image as ImageIcon,
  Smile,
  Store,
  ChevronLeft,
} from "lucide-react";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { useAppSelector } from "@/hooks/hooks";
import {
  useChatConversations,
  useChatMessages,
  useSendChatMessage,
  useMarkConversationAsRead,
} from "@/hooks/queries";
import { Conversation } from "@/types/chat";
import { useSocket } from "@/context/SocketContext";
import { joinConversation, leaveConversation } from "@/socket/chat.socket";
import { toast } from "sonner";
import { getSafeErrorMessage } from "@/api";

export default function MessagesPage() {
  const { data: conversations = [], isLoading: isLoadingConversations } =
    useChatConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const activeConversationId = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.some(
      (conversation) => conversation._id === selectedConversationId,
    )
      ? selectedConversationId
      : null;
  }, [conversations, selectedConversationId]);
  const currentConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation._id === activeConversationId) ??
      null,
    [conversations, activeConversationId],
  );
  const {
    data: messageData,
    isLoading: isLoadingMessages,
  } = useChatMessages(
    { conversationId: activeConversationId ?? "" },
    { enabled: !!activeConversationId },
  );
  const messages = useMemo(() => messageData?.messages ?? [], [messageData?.messages]);

  const sendMessageMutation = useSendChatMessage();
  const markAsReadMutation = useMarkConversationAsRead();
  const isSending = sendMessageMutation.isPending;
  const { data: user } = useAppSelector((state) => state.auth);
  const { socket } = useSocket();

  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket || !activeConversationId) return;
    joinConversation(socket, activeConversationId);
    return () => {
      leaveConversation(socket, activeConversationId);
    };
  }, [socket, activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversationId(conversation._id);
    markAsReadMutation.mutate(conversation._id);
    setShowMobileChat(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation || isSending) return;
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: currentConversation._id,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Không thể gửi tin nhắn"));
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Vừa xong";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ`;
    return date.toLocaleDateString("vi-VN");
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.shop.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-[calc(100vh-140px)] bg-background -mt-4 -mx-4 flex">
      <div
        className={cn(
          "w-full md:w-[320px] bg-white border-r border-[#f0f0f0] flex flex-col",
          showMobileChat && "hidden md:flex",
        )}
      >
        <div className="p-4 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-5 w-5 text-[#E53935]" />
            <h1 className="text-lg font-bold text-gray-800">Tin nhắn</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 border-gray-200 focus:border-[#E53935]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center h-32">
              <SpinnerLoading size={24} color="#E53935" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => handleSelectConversation(conversation)}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer transition-colors border-b border-border",
                  currentConversation?._id === conversation._id
                    ? "bg-[#FFEBEE]"
                    : "hover:bg-[#fafafa]",
                )}
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={conversation.shop.avatar || "/placeholder-shop.png"}
                    alt={conversation.shop.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 text-sm truncate">
                      {conversation.shop.name}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {conversation.lastMessage?.createdAt &&
                        formatTime(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {conversation.lastMessage?.content || "Bắt đầu cuộc trò chuyện"}
                  </p>
                </div>

                {conversation.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-[#E53935] text-white text-[10px] rounded-full flex items-center justify-center shrink-0">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col bg-white",
          !showMobileChat && "hidden md:flex",
        )}
      >
        {currentConversation ? (
          <>
            <div className="p-3 border-b border-[#f0f0f0] flex items-center gap-3">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={currentConversation.shop.avatar || "/placeholder-shop.png"}
                  alt={currentConversation.shop.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-gray-800">
                  {currentConversation.shop.name}
                </h2>
                <span className="text-xs text-[#4CAF50]">Đang hoạt động</span>
              </div>
              <Link href={`/shop/${currentConversation.shop.shopId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-200"
                >
                  <Store className="h-3.5 w-3.5 mr-1" />
                  Xem Shop
                </Button>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingMessages ? (
                <div className="flex-1 flex items-center justify-center bg-white">
                  <SpinnerLoading size={32} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Bắt đầu cuộc trò chuyện</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={cn(
                      "flex",
                      message.sender === user?._id
                        ? "justify-end"
                        : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] px-3 py-2 rounded-lg text-sm",
                        message.sender === user?._id
                          ? "bg-[#E53935] text-white"
                          : "bg-muted text-gray-800",
                      )}
                    >
                      <p>{message.content}</p>
                      <span
                        className={cn(
                          "text-[10px] mt-1 block",
                          message.sender === user?._id
                            ? "text-white/70"
                            : "text-gray-400",
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

            <div className="p-3 border-t border-[#f0f0f0]">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                  <Smile className="h-5 w-5" />
                </button>
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleSendMessage()}
                  className="flex-1 border-gray-200 focus:border-[#E53935]"
                  disabled={isSending}
                />
                <Button
                  onClick={() => void handleSendMessage()}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-[#E53935] hover:bg-[#D32F2F]"
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
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chọn một cuộc trò chuyện</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
