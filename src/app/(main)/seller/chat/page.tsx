"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  ImageIcon,
} from "lucide-react";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMyShop } from "@/hooks/queries";
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

export default function SellerChatPage() {
  const { data: myShop } = useMyShop();
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
  const [searchTerm, setSearchTerm] = useState("");
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
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation || isSending) return;
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: currentConversation._id,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch {
      toast.error("Không thể gửi tin nhắn");
    }
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!myShop) return null;

  return (
    <div className="bg-[#f7f7f7] rounded-2xl overflow-hidden min-h-[70vh] lg:h-[calc(100vh-180px)]">
      <div className="flex h-full flex-col lg:flex-row">
        <div className="w-full lg:w-80 bg-white flex flex-col border-b lg:border-b-0 lg:border-r border-[#f0f0f0]">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#f7f7f7] rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Tin nhắn</h2>
                <p className="text-xs text-gray-500">
                  {conversations.length} cuộc hội thoại
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-[#f7f7f7] border-0"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center h-32">
                <SpinnerLoading noWrapper size={24} className="text-blue-600" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm text-center">Chưa có tin nhắn nào</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation._id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={cn(
                    "w-full p-4 flex items-center gap-3 hover:bg-[#f7f7f7] transition-colors text-left",
                    currentConversation?._id === conversation._id && "bg-[#f7f7f7]",
                  )}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#f7f7f7]">
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
                          <User className="h-5 w-5 text-gray-400" />
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
                      <p className="font-medium text-gray-800 truncate">
                        {conversation.user.name}
                      </p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#f7f7f7]">
          {currentConversation ? (
            <>
              <div className="p-4 bg-white flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f7f7f7]">
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
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {currentConversation.user.name}
                    </p>
                    <p className="text-xs text-green-500">Đang hoạt động</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button variant="ghost" size="icon" className="rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-lg">
                    <Video className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-lg">
                    <Info className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <SpinnerLoading noWrapper size={24} className="text-blue-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Bắt đầu cuộc trò chuyện</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={cn(
                        "flex",
                        message.sender === user?._id ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] px-4 py-2.5 rounded-2xl",
                          message.sender === user?._id
                            ? "bg-primary text-white rounded-br-md"
                            : "bg-white text-gray-800 rounded-bl-md",
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            message.sender === user?._id
                              ? "text-white/70"
                              : "text-gray-400",
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
              <div className="p-4 bg-white">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg shrink-0"
                  >
                    <Smile className="h-5 w-5 text-gray-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg shrink-0"
                  >
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg shrink-0"
                  >
                    <Paperclip className="h-5 w-5 text-gray-400" />
                  </Button>
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void handleSendMessage()}
                    className="flex-1 min-w-[200px] h-11 rounded-xl bg-[#f7f7f7] border-0"
                    disabled={isSending}
                  />
                  <Button
                    onClick={() => void handleSendMessage()}
                    disabled={!newMessage.trim() || isSending}
                    className="bg-primary hover:bg-primary/90 rounded-xl h-11 px-4"
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
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 opacity-50" />
              </div>
              <p className="text-lg font-medium text-gray-600">
                Chọn một cuộc hội thoại
              </p>
              <p className="text-sm mt-1">
                Chọn từ danh sách bên trái để bắt đầu chat
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
