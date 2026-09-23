'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send,
  RotateCcw,
  Search,
  X,
  Square,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Check,
  Flame,
  Headphones,
  ChevronDown,
  Loader2,
  Ruler,
  PackageCheck,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setChatOpen } from '@/features/chat/chatSlice';
import { ChatbotMessage } from '@/types/chat';
import Link from 'next/link';
import api from '@/api/api';
import { ENDPOINT_CHATBOT } from '@/constants/endpoint';
import { useT } from '@/i18n/chatbot';
import { toast } from 'sonner';
import { parseProductsFromContent, ParsedProduct } from './productParser';
import ProductCarousel from './ProductCarousel';
import ComparisonMatrix from './ComparisonMatrix';
import SizeAdvisorCard from './SizeAdvisorCard';
import QuickBuyDrawer from './QuickBuyDrawer';
import ContextualChips from './ContextualChips';
import FeedbackDialog from './FeedbackDialog';
import HumanHandoffModal from './HumanHandoffModal';

const TOOL_NAME_MAP: Record<string, string> = {
  search_products: 'Mia đang tìm kiếm sản phẩm phù hợp...',
  search_products_advanced: 'Mia đang lọc sản phẩm theo yêu cầu...',
  search_products_by_brand: 'Mia đang tìm sản phẩm theo thương hiệu...',
  search_products_by_price_range: 'Mia đang lọc theo khoảng giá...',
  get_discounted_products: 'Mia đang săn deal & mã giảm giá...',
  get_bestseller_products: 'Mia đang lấy danh sách bán chạy...',
  get_new_arrival_products: 'Mia đang tìm các mẫu mới về...',
  get_related_products: 'Mia đang tìm các mẫu tương tự...',
  get_search_filter_options: 'Mia đang tải bộ lọc sản phẩm...',
  get_product_details: 'Mia đang xem thông tin chi tiết...',
  get_categories: 'Mia đang tra cứu danh mục...',
  get_featured_products: 'Mia đang chọn sản phẩm nổi bật...',
  check_product_availability: 'Mia đang kiểm tra tồn kho & size...',
  generate_checkout_link: 'Mia đang chuẩn bị link thanh toán...',
  compare_products: 'Mia đang đối chiếu và lập bảng so sánh...',
};

const CHATBOT_API_BASE_URL = api.defaults.baseURL || '/api';
const CHATBOT_ENABLED = process.env.NEXT_PUBLIC_CHATBOT_ENABLED !== 'false';
const STREAM_TIMEOUT_MS = 45_000;
const DRAFT_KEY = 'chatbot_draft';
const SESSION_KEY = 'chatbot_session';
const MAX_RETRIES = 1;

interface Message extends Omit<ChatbotMessage, 'timestamp'> {
  id: string;
  messageId?: string | null;
  timestamp: Date;
}

type FeedbackState = 'up' | 'down' | null;

interface MessageFeedback {
  [messageId: string]: FeedbackState;
}

// Client-side ID for tracking feedback; server sẽ dùng _id ObjectId sau này.
const uuidLikeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function ChatWidget() {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector((state) => state.chat);
  const t = useT();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<MessageFeedback>({});
  const [serverEnabled, setServerEnabled] = useState<boolean | null>(null);

  // Modals & Enhanced states
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);
  const [feedbackDialogData, setFeedbackDialogData] = useState<{
    msgId: string;
    serverMessageId?: string | null;
  } | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [quickBuyProduct, setQuickBuyProduct] = useState<ParsedProduct | null>(null);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);

  const handleOpenQuickBuy = useCallback((product: ParsedProduct) => {
    setQuickBuyProduct(product);
    setIsQuickBuyOpen(true);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserTextRef = useRef<string | null>(null);

  // Quick actions / Featured capabilities
  const quickActions = useMemo(
    () => [
      {
        icon: <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
        bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200/60 dark:border-orange-800/40',
        label: t.quickSale,
        desc: 'Sản phẩm ưu đãi sâu nhất hôm nay',
        query: t.querySale,
      },
      {
        icon: <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
        bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/40',
        label: t.quickFind,
        desc: 'Theo danh mục, kích cỡ & giá',
        query: t.queryFind,
      },
      {
        icon: <Ruler className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40',
        label: 'Tư vấn chọn size',
        desc: 'Chuẩn theo chiều cao & cân nặng',
        query: 'Tư vấn chọn size theo chiều cao cân nặng',
      },
      {
        icon: <PackageCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
        bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/40',
        label: 'Chính sách & Vận chuyển',
        desc: 'Đổi trả, freeship, bảo hành',
        query: 'Chính sách đổi trả hàng và phí vận chuyển như thế nào?',
      },
    ],
    [t],
  );

  // Fast suggestion chips
  const suggestionChips = useMemo(
    () => [
      { label: '🔥 Top bán chạy', query: t.queryBest },
      { label: '✨ Hàng mới về', query: 'Có những sản phẩm mới về nào hot nhất?' },
      { label: '🎟️ Voucher áp dụng', query: 'Có mã giảm giá hoặc voucher nào hôm nay không?' },
      { label: '💰 Đồ dưới 300K', query: 'Tìm cho tôi các sản phẩm có giá dưới 300.000đ' },
    ],
    [t],
  );

  // Load session + draft on mount
  useEffect(() => {
    const savedSession = typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
    const savedDraft = typeof window !== 'undefined' ? localStorage.getItem(DRAFT_KEY) : null;
    if (savedDraft) setInput(savedDraft);
    if (savedSession) {
      setSessionId(savedSession);
      loadHistory(savedSession);
    }

    // Check server-side feature flag (kill switch / canary rollout).
    fetch(`${CHATBOT_API_BASE_URL}${ENDPOINT_CHATBOT.STATUS}`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.status === 'success' && typeof data?.data?.enabled === 'boolean') {
          setServerEnabled(data.data.enabled);
        }
      })
      .catch(() => {
        /* ignore - dùng client flag */
      });
  }, []);

  // Persist draft on every input change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handle = setTimeout(() => {
      if (input.trim()) {
        localStorage.setItem(DRAFT_KEY, input);
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [input]);

  // Auto-scroll to bottom when messages or streaming content changes
  const scrollToBottom = useCallback((smooth = false) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Track scroll position to show "Scroll to bottom" button
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isUp = scrollHeight - (scrollTop + clientHeight) > 120;
    setShowScrollBottom(isUp);
  }, []);

  // Focus trap, scroll-lock, and focus restore
  useEffect(() => {
    if (!isOpen) return;
    triggerRef.current = document.activeElement as HTMLElement;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) document.body.style.overflow = 'hidden';

    setTimeout(() => inputRef.current?.focus(), 150);

    return () => {
      document.body.style.overflow = '';
      if (triggerRef.current) triggerRef.current.focus();
    };
  }, [isOpen]);

  // Keyboard: Esc to close, Tab focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(setChatOpen(false));
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex="0"]',
        );
        if (!focusable.length) return;
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dispatch]);

  const loadHistory = async (sid: string) => {
    try {
      const res = await fetch(`${CHATBOT_API_BASE_URL}${ENDPOINT_CHATBOT.history(sid)}`, {
        credentials: 'include',
      });
      if (!res.ok || res.status === 403 || res.status === 401) {
        // Stale or unverified session ID in localStorage - reset
        setSessionId(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SESSION_KEY);
        }
        return;
      }
      const data = await res.json();
      if (data.status === 'success' && data.data?.messages) {
        setMessages(
          (data.data.messages as Array<Omit<Message, 'id'>>).map((m) => ({
            ...m,
            id: uuidLikeId(),
            timestamp: new Date(m.timestamp as unknown as string),
          })),
        );
      } else {
        setSessionId(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load chat history (clearing stale session):', error);
      setSessionId(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  };

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  /**
   * Send message với auto-retry 1 lần nếu lỗi mạng.
   */
  const sendMessage = useCallback(
    async (text: string, options: { regenerate?: boolean } = {}) => {
      if (!text.trim() || isLoading) return;

      const trimmedText = text.trim();

      // Check human handoff intent (e.g., "gặp nhân viên", "tổng đài")
      const handoffKeywords = ['gặp nhân viên', 'tổng đài', 'gọi cskh', 'người thật', 'tư vấn viên', 'liên hệ shop'];
      if (handoffKeywords.some((kw) => trimmedText.toLowerCase().includes(kw))) {
        setIsHandoffOpen(true);
      }

      const userMessage: Message = {
        id: uuidLikeId(),
        role: 'user',
        content: trimmedText,
        timestamp: new Date(),
      };

      if (options.regenerate) {
        // Xoá message user cuối + assistant cuối
        setMessages((prev) => {
          const withoutLast = [...prev];
          if (withoutLast[withoutLast.length - 1]?.role === 'assistant') withoutLast.pop();
          if (withoutLast[withoutLast.length - 1]?.role === 'user') withoutLast.pop();
          return [...withoutLast, userMessage];
        });
      } else {
        setMessages((prev) => [...prev, userMessage]);
      }

      setInput('');
      setIsLoading(true);
      setStreamingContent('');
      setActiveTool(null);
      lastUserTextRef.current = trimmedText;

      let timedOut = false;
      const controller = new AbortController();
      abortRef.current = controller;
      let streamTimer: ReturnType<typeof setTimeout> | null = null;

      const armTimer = () => {
        if (streamTimer) clearTimeout(streamTimer);
        streamTimer = setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, STREAM_TIMEOUT_MS);
      };
      const disarmTimer = () => {
        if (streamTimer) {
          clearTimeout(streamTimer);
          streamTimer = null;
        }
      };

      const payload: Record<string, unknown> = { message: trimmedText };
      if (sessionId) {
        payload.sessionId = sessionId;
      }

      const tryFetch = async (attempt: number): Promise<void> => {
        try {
          const res = await fetch(`${CHATBOT_API_BASE_URL}${ENDPOINT_CHATBOT.STREAM}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => null);
            const errMsg = errData?.message || `Stream request failed: ${res.status}`;

            // Self-healing: if session ownership cannot be verified (403/401) or invalid session,
            // immediately clear the stale session and retry fresh without sessionId so server assigns a new one
            if ((res.status === 403 || res.status === 401 || errMsg.toLowerCase().includes('session')) && payload.sessionId) {
              setSessionId(null);
              if (typeof window !== 'undefined') {
                localStorage.removeItem(SESSION_KEY);
              }
              delete payload.sessionId;
              return tryFetch(attempt);
            }

            throw new Error(errMsg);
          }
          if (!res.body) throw new Error('No response body');

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let fullContent = '';
          let sseBuffer = '';
          armTimer();

          while (true) {
            if (timedOut) break;
            const { done, value } = await reader.read();
            if (done) break;
            armTimer();

            // stream: true để không cắt vỡ ký tự UTF-8 (tiếng Việt) ở ranh giới chunk
            sseBuffer += decoder.decode(value, { stream: true });

            // Một frame SSE có thể bị cắt ngang giữa 2 network chunk → chỉ xử lý
            // các dòng đã hoàn chỉnh, giữ lại dòng cuối còn dở cho chunk kế tiếp.
            const lines = sseBuffer.split('\n');
            sseBuffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'session' && data.sessionId) {
                  if (data.sessionId !== sessionId) {
                    setSessionId(data.sessionId);
                    localStorage.setItem(SESSION_KEY, data.sessionId);
                  }
                } else if (data.type === 'tool' && data.name) {
                  setActiveTool(TOOL_NAME_MAP[data.name] || 'Mia đang xử lý yêu cầu...');
                } else if (data.type === 'token') {
                  setActiveTool(null);
                  fullContent += data.content;
                  setStreamingContent(fullContent);
                } else if (data.type === 'correction') {
                  setActiveTool(null);
                  fullContent = data.content;
                  setStreamingContent(data.content);
                } else if (data.type === 'done') {
                  setActiveTool(null);
                  const finalContent =
                    fullContent.trim() ||
                    (data.success === false
                      ? t.networkError
                      : 'Dạ em chào anh/chị, em có thể hỗ trợ gì cho mình hôm nay ạ?');
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: uuidLikeId(),
                      role: 'assistant',
                      content: finalContent,
                      messageId: data.messageId ?? null,
                      timestamp: new Date(),
                    },
                  ]);
                  setStreamingContent('');
                } else if (data.type === 'error') {
                  setActiveTool(null);
                  const errorMsg = data.message || t.networkError;
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: uuidLikeId(),
                      role: 'assistant',
                      content: errorMsg,
                      timestamp: new Date(),
                    },
                  ]);
                  setStreamingContent('');
                  return;
                }
              } catch (e) {
                console.error('Invalid JSON chunk:', e);
              }
            }
          }
        } catch (error) {
          setActiveTool(null);
          if (timedOut) {
            setMessages((prev) => [
              ...prev,
              {
                id: uuidLikeId(),
                role: 'assistant',
                content: t.timeout,
                timestamp: new Date(),
              },
            ]);
            setStreamingContent('');
            return;
          }

          if (controller.signal.aborted) {
            // Người dùng bấm Stop
            setStreamingContent('');
            return;
          }

          // If session related error, clean up stale session from localStorage immediately
          if (String(error).toLowerCase().includes('session') || String(error).includes('403')) {
            setSessionId(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem(SESSION_KEY);
            }
          }

          // Auto-retry 1 lần nếu là network error
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, 800));
            return tryFetch(attempt + 1);
          }

          console.error('Chat error:', error);
          setStreamingContent('');
          setMessages((prev) => [
            ...prev,
            {
              id: uuidLikeId(),
              role: 'assistant',
              content: t.networkError,
              timestamp: new Date(),
            },
          ]);
        } finally {
          disarmTimer();
          if (abortRef.current === controller) abortRef.current = null;
        }
      };

      try {
        await tryFetch(0);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, t],
  );

  const regenerate = useCallback(() => {
    if (isLoading || !lastUserTextRef.current) return;
    sendMessage(lastUserTextRef.current, { regenerate: true });
  }, [isLoading, sendMessage]);

  const copyMessage = useCallback(
    async (msgId: string, content: string) => {
      try {
        await navigator.clipboard.writeText(content);
        setCopiedId(msgId);
        toast.success(t.copied);
        setTimeout(() => setCopiedId((prev) => (prev === msgId ? null : prev)), 1500);
      } catch (e) {
        console.error('Copy failed:', e);
      }
    },
    [t.copied],
  );

  // Positive Thumbs Up
  const handleThumbsUp = useCallback(
    async (msgId: string, serverMessageId?: string | null) => {
      if (!sessionId) return;
      const prev = feedback[msgId];
      const next: FeedbackState = prev === 'up' ? null : 'up';
      setFeedback((f) => ({ ...f, [msgId]: next }));

      if (next === null) return;

      try {
        await fetch(`${CHATBOT_API_BASE_URL}${ENDPOINT_CHATBOT.FEEDBACK}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            messageId: serverMessageId || msgId,
            rating: 'up',
          }),
        });
        toast.success(t.feedbackThanks);
      } catch (e) {
        console.error('Feedback send failed:', e);
        setFeedback((f) => ({ ...f, [msgId]: prev }));
      }
    },
    [feedback, sessionId, t.feedbackThanks],
  );

  // Negative Thumbs Down - triggers detailed feedback dialog
  const handleThumbsDownClick = useCallback(
    (msgId: string, serverMessageId?: string | null) => {
      setFeedbackDialogData({ msgId, serverMessageId });
    },
    [],
  );

  // Submit feedback with reason & comment
  const handleFeedbackSubmit = useCallback(
    async (reason: string, comment?: string) => {
      if (!feedbackDialogData || !sessionId) return;
      const { msgId, serverMessageId } = feedbackDialogData;
      setIsSubmittingFeedback(true);

      const combinedComment = comment ? `${reason}: ${comment}` : reason;

      try {
        await fetch(`${CHATBOT_API_BASE_URL}${ENDPOINT_CHATBOT.FEEDBACK}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            messageId: serverMessageId || msgId,
            rating: 'down',
            comment: combinedComment,
          }),
        });
        setFeedback((f) => ({ ...f, [msgId]: 'down' }));
        toast.success(t.feedbackThanks);
      } catch (e) {
        console.error('Failed to submit detailed feedback:', e);
        toast.error(t.feedbackFail);
      } finally {
        setIsSubmittingFeedback(false);
      }
    },
    [feedbackDialogData, sessionId, t.feedbackFail, t.feedbackThanks],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      stopStream();
      return;
    }
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLoading) {
        stopStream();
      } else {
        sendMessage(input);
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setStreamingContent('');
    setInput('');
    setFeedback({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(DRAFT_KEY);
    }
    toast.info(t.clearChat);
  };

  // Find last assistant message for regenerate button & contextual suggestions
  const lastMessage = messages[messages.length - 1];
  const lastAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i];
    }
    return null;
  }, [messages]);

  const canRegenerate =
    !isLoading && !!lastUserTextRef.current && lastMessage?.role === 'assistant';

  // Feature flag: tắt hoàn toàn nếu env flag = false hoặc server flag = false
  if (!CHATBOT_ENABLED) return null;
  if (serverEnabled === false) return null;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label={t.closeDialogLabel}
          className="fixed inset-0 z-40 cursor-default bg-black/20 backdrop-blur-xs transition-opacity"
          onClick={() => dispatch(setChatOpen(false))}
        />
      )}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.dialogLabel}
        aria-hidden={!isOpen}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex h-[100dvh] w-full flex-col border-l border-border bg-card shadow-2xl outline-none transition-transform duration-250 ease-out md:w-[420px]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          !isOpen && 'pointer-events-none',
        )}
      >
        {/* Unified Glass Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-card/95 px-4 backdrop-blur-md shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <Headphones className="h-5 w-5" aria-hidden="true" />
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-card ring-2 ring-card"
                title="Mia đang trực tuyến"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-foreground">Trợ lý Mua Sắm (Mia)</h2>
                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Trực tuyến
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                Tư vấn sản phẩm & dịch vụ khách hàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsHandoffOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95"
              title="Kết nối nhân viên CSKH"
            >
              <Headphones className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">CSKH</span>
            </button>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                title={t.clearChat}
                aria-label={t.clearChat}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={() => dispatch(setChatOpen(false))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
              aria-label={t.close}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-busy={isLoading}
          aria-label="Chat messages"
          className="min-h-0 flex-1 overflow-y-auto bg-muted/15 p-4 space-y-4"
          style={{ overscrollBehavior: 'contain' }}
        >
          {messages.length === 0 && !streamingContent ? (
            <div className="flex flex-col gap-4 py-2">
              {/* Welcome Card */}
              <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Headphones className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Trung tâm hỗ trợ mua sắm
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  Xin chào bạn! 👋
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                  {t.welcome}
                </p>
              </div>

              {/* Feature Cards Grid */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
                  Gợi ý yêu cầu nhanh
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(action.query)}
                      className="group flex flex-col justify-between p-3 bg-card border border-border/80 rounded-xl hover:border-primary/50 hover:shadow-xs transition-all text-left active:scale-98"
                      aria-label={action.label}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg border', action.bg)}>
                          {action.icon}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {action.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 line-clamp-1 mt-0.5">
                          {action.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Suggestion Chips */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
                  Câu hỏi phổ biến
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestionChips.map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(chip.query)}
                      className="inline-flex items-center rounded-full border border-border/80 bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95 shadow-2xs"
                    >
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => {
                const isLastAssistant =
                  msg.role === 'assistant' && i === messages.length - 1;

                // Parse rich product cards for assistant messages
                const parsedContent =
                  msg.role === 'assistant'
                    ? parseProductsFromContent(msg.content)
                    : null;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-start gap-2.5',
                      msg.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 mt-0.5 shadow-2xs"
                        aria-hidden="true"
                      >
                        <Headphones className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-2xs',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-xs font-medium'
                          : 'bg-card text-foreground border border-border/70 rounded-tl-xs font-normal',
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <>
                          {/* Case 1: Structured response with Adaptive Components */}
                          {parsedContent?.hasProducts ? (
                            <div className="space-y-2.5">
                              {parsedContent.introText && (
                                <div className="prose prose-sm max-w-none text-foreground">
                                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                    {parsedContent.introText}
                                  </ReactMarkdown>
                                </div>
                              )}

                              {/* Adaptive Product Layout: Comparison Matrix or Horizontal Carousel */}
                              {parsedContent.isComparison ? (
                                <ComparisonMatrix
                                  products={parsedContent.products}
                                  onQuickBuy={handleOpenQuickBuy}
                                />
                              ) : (
                                <ProductCarousel
                                  products={parsedContent.products}
                                  onQuickBuy={handleOpenQuickBuy}
                                />
                              )}

                              {/* Interactive Sizing Advisor Guide */}
                              {parsedContent.isSizeAdvice && (
                                <SizeAdvisorCard onSelectSizeQuery={sendMessage} />
                              )}

                              {parsedContent.outroText && (
                                <div className="prose prose-sm max-w-none text-foreground pt-1">
                                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                    {parsedContent.outroText}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Case 2: Standard Markdown text */
                            <div className="space-y-2">
                              <div className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>li]:mb-0.5 text-foreground prose-a:text-primary hover:prose-a:underline font-normal leading-relaxed">
                                <ReactMarkdown
                                  rehypePlugins={[rehypeSanitize]}
                                  components={{
                                    a: ({ href, children }) => {
                                      if (!href) return <span>{children}</span>;
                                      if (href.startsWith('/')) {
                                        return (
                                          <Link
                                            href={href}
                                            className="text-primary hover:underline font-bold"
                                          >
                                            {children}
                                          </Link>
                                        );
                                      }
                                      return (
                                        <a
                                          href={href}
                                          className="text-primary hover:underline font-bold"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {children}
                                        </a>
                                      );
                                    },
                                  }}
                                >
                                  {msg.content || 'Dạ em chào anh/chị, em có thể hỗ trợ gì cho mình hôm nay ạ?'}
                                </ReactMarkdown>
                              </div>

                              {/* Standalone Sizing Guide when customer asks for sizing without product cards */}
                              {parsedContent?.isSizeAdvice && (
                                <SizeAdvisorCard onSelectSizeQuery={sendMessage} />
                              )}
                            </div>
                          )}

                          {/* Message actions: copy + feedback + regenerate */}
                          <div
                            className="mt-2.5 flex items-center gap-1 text-muted-foreground/60 border-t border-border/40 pt-1.5"
                            role="group"
                            aria-label="Message actions"
                          >
                            <button
                              onClick={() => copyMessage(msg.id, msg.content)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted hover:text-foreground transition-colors"
                              aria-label={copiedId === msg.id ? t.copied : t.copy}
                              title={t.copy}
                            >
                              {copiedId === msg.id ? (
                                <Check className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                              ) : (
                                <Copy className="h-3 w-3" aria-hidden="true" />
                              )}
                            </button>

                            <button
                              onClick={() => handleThumbsUp(msg.id, msg.messageId)}
                              className={cn(
                                'inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted transition-colors',
                                feedback[msg.id] === 'up'
                                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                                  : 'hover:text-foreground',
                              )}
                              aria-label="Thích"
                              aria-pressed={feedback[msg.id] === 'up'}
                              title="Câu trả lời hữu ích"
                            >
                              <ThumbsUp
                                className="h-3 w-3"
                                aria-hidden="true"
                                fill={feedback[msg.id] === 'up' ? 'currentColor' : 'none'}
                              />
                            </button>

                            <button
                              onClick={() => handleThumbsDownClick(msg.id, msg.messageId)}
                              className={cn(
                                'inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted transition-colors',
                                feedback[msg.id] === 'down'
                                  ? 'text-destructive bg-destructive/10 font-bold'
                                  : 'hover:text-foreground',
                              )}
                              aria-label="Không thích"
                              aria-pressed={feedback[msg.id] === 'down'}
                              title="Góp ý câu trả lời chưa tốt"
                            >
                              <ThumbsDown
                                className="h-3 w-3"
                                aria-hidden="true"
                                fill={feedback[msg.id] === 'down' ? 'currentColor' : 'none'}
                              />
                            </button>

                            {isLastAssistant && canRegenerate && (
                              <button
                                onClick={regenerate}
                                className="inline-flex h-6 items-center gap-1 px-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-auto"
                                aria-label={t.regenerate}
                                title={t.regenerate}
                              >
                                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                                <span>{t.regenerate}</span>
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Active Tool Execution Indicator */}
              {activeTool && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold animate-pulse w-fit mx-auto my-2 border border-primary/20 shadow-2xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{activeTool}</span>
                </div>
              )}

              {/* Streaming content (live region) */}
              {streamingContent && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 mt-0.5 shadow-2xs"
                    aria-hidden="true"
                  >
                    <Headphones className="h-3.5 w-3.5" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-sm bg-card text-foreground border border-border/70 shadow-2xs font-normal leading-relaxed">
                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                      {streamingContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Loading dots */}
              {isLoading && !streamingContent && (
                <div className="flex items-start gap-2.5 justify-start" aria-hidden="true">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 mt-0.5 shadow-2xs">
                    <Headphones className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-card rounded-2xl rounded-tl-xs px-3.5 py-2.5 border border-border/70 shadow-2xs">
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              {/* Contextual Quick Reply Chips */}
              {!isLoading && !streamingContent && lastAssistantMessage && (
                <ContextualChips
                  lastMessageContent={lastAssistantMessage.content}
                  onSelectChip={sendMessage}
                  onOpenHandoff={() => setIsHandoffOpen(true)}
                  disabled={isLoading}
                />
              )}
            </div>
          )}
        </div>

        {/* Scroll to bottom floating button */}
        {showScrollBottom && (
          <div className="absolute bottom-20 right-4 z-10 animate-fade-in">
            <button
              type="button"
              onClick={() => scrollToBottom(true)}
              className="flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground shadow-lg hover:bg-primary-hover transition-all active:scale-95"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              <span>{t.scrollToBottom}</span>
            </button>
          </div>
        )}

        {/* Input Area - Integrated Modern Capsule Composer */}
        <div className="sticky bottom-0 mt-auto border-t border-border/70 bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xs">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded-2xl border border-border/80 bg-muted/30 p-2.5 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/10 shadow-2xs"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi hoặc yêu cầu tìm đồ..."
              rows={1}
              aria-label={t.placeholder}
              className="w-full resize-none border-0 bg-transparent px-1 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-medium"
              style={{ minHeight: '38px', maxHeight: '100px' }}
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                <kbd className="rounded border border-border/60 bg-muted/60 px-1 text-[9px] font-mono">Enter</kbd>
                để gửi
              </span>
              {isLoading ? (
                <button
                  type="button"
                  onClick={stopStream}
                  className="inline-flex h-7 items-center gap-1 rounded-full bg-destructive/10 px-2.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
                  aria-label={t.stop}
                  title={t.stop}
                >
                  <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                  <span>Dừng</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200',
                    input.trim()
                      ? 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs active:scale-95'
                      : 'bg-muted text-muted-foreground/40 cursor-not-allowed',
                  )}
                  aria-label="Gửi tin nhắn"
                >
                  <Send className="h-3.5 w-3.5 -translate-y-px translate-x-px" aria-hidden="true" />
                </button>
              )}
            </div>
          </form>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
            Mia có thể nhầm lẫn. Vui lòng kiểm tra lại thông tin quan trọng.
          </p>
        </div>
      </div>

      {/* Human Support Handoff Modal */}
      <HumanHandoffModal
        isOpen={isHandoffOpen}
        onClose={() => setIsHandoffOpen(false)}
      />

      {/* Detailed Feedback Dialog */}
      <FeedbackDialog
        isOpen={!!feedbackDialogData}
        onClose={() => setFeedbackDialogData(null)}
        onSubmit={handleFeedbackSubmit}
        isSubmitting={isSubmittingFeedback}
      />

      {/* Quick Buy Variant Selection Sheet */}
      <QuickBuyDrawer
        product={quickBuyProduct}
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
      />
    </>
  );
}
