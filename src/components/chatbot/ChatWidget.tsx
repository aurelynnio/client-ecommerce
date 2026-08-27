'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send,
  Bot,
  RotateCcw,
  Search,
  X,
  Square,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Check,
  Tag,
  Flame,
  Shirt,
  Headphones,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { parseProductsFromContent } from './productParser';
import ChatProductCard from './ChatProductCard';
import ContextualChips from './ContextualChips';
import FeedbackDialog from './FeedbackDialog';
import HumanHandoffModal from './HumanHandoffModal';

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

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserTextRef = useRef<string | null>(null);

  // Quick actions
  const quickActions = useMemo(
    () => [
      { icon: <Search className="h-4 w-4" />, label: t.quickFind, query: t.queryFind },
      { icon: <Tag className="h-4 w-4" />, label: t.quickSale, query: t.querySale },
      { icon: <Flame className="h-4 w-4" />, label: t.quickBest, query: t.queryBest },
      { icon: <Shirt className="h-4 w-4" />, label: t.quickFashion, query: t.queryFashion },
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
      const data = await res.json();
      if (data.status === 'success' && data.data?.messages) {
        setMessages(
          (data.data.messages as Array<Omit<Message, 'id'>>).map((m) => ({
            ...m,
            id: uuidLikeId(),
            timestamp: new Date(m.timestamp as unknown as string),
          })),
        );
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
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
            throw new Error(errData?.message || `Stream request failed: ${res.status}`);
          }
          if (!res.body) throw new Error('No response body');

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let fullContent = '';
          armTimer();

          while (true) {
            if (timedOut) break;
            const { done, value } = await reader.read();
            if (done) break;
            armTimer();

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'session' && data.sessionId) {
                  if (data.sessionId !== sessionId) {
                    setSessionId(data.sessionId);
                    localStorage.setItem(SESSION_KEY, data.sessionId);
                  }
                } else if (data.type === 'token') {
                  fullContent += data.content;
                  setStreamingContent(fullContent);
                } else if (data.type === 'done') {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: uuidLikeId(),
                      role: 'assistant',
                      content: fullContent,
                      messageId: data.messageId ?? null,
                      timestamp: new Date(),
                    },
                  ]);
                  setStreamingContent('');
                } else if (data.type === 'error') {
                  throw new Error('Chatbot stream error');
                }
              } catch (e) {
                console.error('Invalid JSON chunk:', e);
              }
            }
          }
        } catch (error) {
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
        {/* Top Bar */}
        <div className="flex h-10 items-center justify-between border-b border-border bg-muted/40 px-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" aria-hidden="true"></span>
            <span className="text-xs font-semibold text-muted-foreground">{t.ready}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsHandoffOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
              title="Kết nối nhân viên CSKH"
            >
              <Headphones className="h-3.5 w-3.5" />
              <span>{t.cskhSupport}</span>
            </button>
            <button
              onClick={() => dispatch(setChatOpen(false))}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              aria-label={t.close}
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.close}</span>
            </button>
          </div>
        </div>

        {/* Header Info */}
        <div className="bg-card border-b border-border px-4 py-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <span>{t.assistant}</span>
                  <span className="rounded-full bg-primary-light px-1.5 py-0.2 text-[10px] font-extrabold text-primary">
                    AI PRO
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-primary shadow-2xs"
                title={t.clearChat}
                aria-label={t.clearChat}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
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
            <div className="space-y-4 pt-1">
              <div className="bg-card border border-border/90 rounded-2xl p-4 shadow-xs">
                <p className="text-sm text-foreground mb-1.5 flex items-center gap-1.5">
                  <span className="font-extrabold text-primary text-base">Chào bạn! ✨</span>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {t.welcome}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                  Yêu cầu phổ biến:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(action.query)}
                      className="flex items-center gap-2.5 p-3 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-primary-light transition-all text-left group shadow-2xs active:scale-98"
                      aria-label={action.label}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {action.icon}
                      </span>
                      <span className="text-xs text-foreground group-hover:text-primary font-bold transition-colors">
                        {action.label}
                      </span>
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
                        className="h-7 w-7 rounded-xl bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
                        aria-hidden="true"
                      >
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed border shadow-xs',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground border-primary/10 rounded-tr-xs font-medium'
                          : 'bg-card text-foreground border-border/80 rounded-tl-xs font-medium',
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <>
                          {/* Case 1: Structured response with Rich Product Cards */}
                          {parsedContent?.hasProducts ? (
                            <div className="space-y-2.5">
                              {parsedContent.introText && (
                                <div className="prose prose-sm max-w-none text-foreground">
                                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                    {parsedContent.introText}
                                  </ReactMarkdown>
                                </div>
                              )}

                              {/* Interactive Product Grid */}
                              <div className="grid grid-cols-1 gap-2 pt-1">
                                {parsedContent.products.map((product) => (
                                  <ChatProductCard key={product.id} product={product} />
                                ))}
                              </div>

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
                            <div className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>li]:mb-0.5 text-foreground prose-a:text-primary hover:prose-a:underline font-medium">
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
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}

                          {/* Message actions: copy + feedback + regenerate */}
                          <div
                            className="mt-2 flex items-center gap-1 text-foreground/50 border-t border-border/40 pt-1.5"
                            role="group"
                            aria-label="Message actions"
                          >
                            <button
                              onClick={() => copyMessage(msg.id, msg.content)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted hover:text-primary transition-colors"
                              aria-label={copiedId === msg.id ? t.copied : t.copy}
                              title={t.copy}
                            >
                              {copiedId === msg.id ? (
                                <Check className="h-3 w-3 text-success" aria-hidden="true" />
                              ) : (
                                <Copy className="h-3 w-3" aria-hidden="true" />
                              )}
                            </button>

                            <button
                              onClick={() => handleThumbsUp(msg.id, msg.messageId)}
                              className={cn(
                                'inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted transition-colors',
                                feedback[msg.id] === 'up'
                                  ? 'text-success bg-success/15 font-bold'
                                  : 'hover:text-primary',
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
                                  ? 'text-destructive bg-destructive/15 font-bold'
                                  : 'hover:text-primary',
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
                                className="inline-flex h-6 items-center gap-1 px-1.5 rounded-md text-xs font-semibold hover:bg-muted hover:text-primary transition-colors ml-auto"
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

              {/* Streaming content (live region) */}
              {streamingContent && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div
                    className="h-7 w-7 rounded-xl bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
                    aria-hidden="true"
                  >
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-sm bg-card text-foreground border border-border shadow-xs font-medium">
                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                      {streamingContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Loading dots */}
              {isLoading && !streamingContent && (
                <div className="flex items-start gap-2.5 justify-start" aria-hidden="true">
                  <div className="h-7 w-7 rounded-xl bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-card rounded-2xl rounded-tl-xs px-3.5 py-2.5 border border-border shadow-xs">
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
          <div className="absolute bottom-16 right-4 z-10 animate-fade-in">
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

        {/* Input Area */}
        <div className="sticky bottom-0 mt-auto border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                disabled={false}
                rows={1}
                aria-label={t.placeholder}
                className="w-full resize-none rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 disabled:opacity-50 font-medium placeholder:text-muted-foreground/70"
                style={{ minHeight: '42px', maxHeight: '100px' }}
              />
            </div>
            {isLoading ? (
              <Button
                type="button"
                onClick={stopStream}
                size="icon"
                className="h-10 w-10 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground shrink-0 shadow-xs"
                aria-label={t.stop}
                title={t.stop}
              >
                <Square className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!input.trim()}
                size="icon"
                className="h-10 w-10 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shrink-0 shadow-xs active:scale-95 transition-transform"
                aria-label="Gửi tin nhắn"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </form>
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
    </>
  );
}
