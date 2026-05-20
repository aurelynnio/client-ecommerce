import { BaseEntity } from "./common";

export type MessageType = "text" | "image" | "product";
export type ExtendedMessageType = MessageType | "file";

export type SenderType = "user" | "shop";

export interface ChatAttachment {
  url: string;
  fileName: string;
  mimeType?: string;
  size?: number;
  resourceType?: string;
}

export interface Message extends BaseEntity {
  conversation: string;
  sender: string;
  senderType: SenderType;
  content: string;
  messageType: ExtendedMessageType;
  attachments?: ChatAttachment[];
  productRef?: string;
  isRead: boolean;
}

export interface ConversationParticipant {
  _id: string;
  name: string;
  avatar?: string;
}

export interface ShopParticipant extends ConversationParticipant {
  shopId: string;
}

export interface Conversation extends BaseEntity {
  user: ConversationParticipant;
  shop: ShopParticipant;
  lastMessage?: Message;
  unreadCount: number;
}

export interface StartConversationPayload {
  shopId: string;
  productId?: string;
  message?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  files?: File[];
  messageType?: ExtendedMessageType;
  productRef?: string;
}

export type ChatbotRole = "user" | "assistant";

export interface ChatbotMessage {
  role: ChatbotRole;
  content: string;
  timestamp?: string;
}

export interface ChatState {
  isOpen: boolean;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
}

export interface ChatPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ChatState {
  isOpen: boolean;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  pagination: ChatPagination | null;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
}

