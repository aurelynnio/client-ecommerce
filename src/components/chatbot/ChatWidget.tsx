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

const CHATBOT_API_BASE_URL = api.defaults.baseURL || '/api';
const CHATBOT_ENABLED = process.env.NEXT_PUBLIC_CHATBOT_ENABLED !== 'false';
const STREAM_TIMEOUT_MS = 45_000;
const DRAFT_KEY = 'chatbot_draft';
const SESSION_KEY = 'chatbot_session';
const MAX_RETRIES = 1;

interface Message extends Omit<ChatbotMessage, 'timestamp'> {
  id: string;
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
    // Nếu fail (network) thì fallback theo client env flag.
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
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

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

      const userMessage: Message = {
        id: uuidLikeId(),
        role: 'user',
        content: text.trim(),
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
      lastUserTextRef.current = text.trim();

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

      const tryFetch = async (attempt: number): Promise<void> => {
        try {
          const res = await fetch(`${CHATBOT_API_BASE_URL}${ENDPOINT_CHATBOT.STREAM}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text.trim(), sessionId }),
            signal: controller.signal,
          });

          if (!res.ok) throw new Error(`Stream request failed: ${res.status}`);
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
        setTimeout(() => setCopiedId((prev) => (prev === msgId ? null : prev)), 1500);
      } catch (e) {
        console.error('Copy failed:', e);
      }
    },
    [],
  );

  const sendFeedback = useCallback(
    async (msgId: string, rating: 'up' | 'down') => {
      if (!sessionId) return;
      const prev = feedback[msgId];
      // Toggle: nếu click lại cùng loại thì bỏ
      const next: FeedbackState = prev === rating ? null : rating;
      setFeedback((f) => ({ ...f, [msgId]: next }));

      if (next === null) return;

      try {
        await fetch(`${CHATBOT_API_BASE_URL}${ENDPOINT_CHATBOT.FEEDBACK}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            messageId: msgId,
            rating: next,
          }),
        });
      } catch (e) {
        console.error('Feedback send failed:', e);
        setFeedback((f) => ({ ...f, [msgId]: prev }));
      }
    },
    [feedback, sessionId],
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
  };

  // Find last user message + last assistant message for regenerate button
  const lastMessage = messages[messages.length - 1];
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
          className="fixed inset-0 z-40 cursor-default bg-black/20"
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
          'fixed inset-y-0 right-0 z-50 flex h-[100dvh] w-full flex-col border-l border-border bg-card shadow-lg outline-none transition-transform duration-200 ease-out md:w-[390px]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          !isOpen && 'pointer-events-none',
        )}
      >
        {/* Top Bar */}
        <div className="flex h-10 items-center justify-between border-b border-border bg-muted/40 px-4">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true"></span>
            <span className="text-xs font-medium text-muted-foreground">{t.ready}</span>
          </div>
          <button
            onClick={() => dispatch(setChatOpen(false))}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            aria-label={t.close}
          >
            <X className="w-3 h-3" aria-hidden="true" />
            <span>{t.close}</span>
          </button>
        </div>

        {/* Header Info */}
        <div className="bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Bot className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{t.assistant}</h3>
                <p className="text-xs text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
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
          role="log"
          aria-live="polite"
          aria-busy={isLoading}
          aria-label="Chat messages"
          className="min-h-0 flex-1 overflow-y-auto bg-muted/20"
          style={{ overscrollBehavior: 'contain' }}
        >
          {messages.length === 0 && !streamingContent ? (
            <div className="p-4 space-y-4">
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                <p className="text-sm text-foreground mb-1">
                  <span className="font-bold text-primary">Xin chào!</span>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {t.welcome}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action.query)}
                    className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl hover:bg-primary-light transition-colors text-left group"
                    aria-label={action.label}
                  >
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">
                      {action.icon}
                    </span>
                    <span className="text-xs text-foreground group-hover:text-primary font-bold transition-colors">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {messages.map((msg, i) => {
                const isLastAssistant =
                  msg.role === 'assistant' && i === messages.length - 1;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-start gap-2',
                      msg.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div
                        className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed border shadow-xs',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground border-primary/10 rounded-tr-xs font-medium'
                          : 'bg-card text-foreground border-border rounded-tl-xs font-medium',
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <>
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
                          {/* Actions: copy + feedback */}
                          <div
                            className="mt-1.5 flex items-center gap-1 text-foreground/50"
                            role="group"
                            aria-label="Message actions"
                          >
                            <button
                              onClick={() => copyMessage(msg.id, msg.content)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted hover:text-primary transition-colors"
                              aria-label={copiedId === msg.id ? t.copied : t.copy}
                              title={t.copy}
                            >
                              {copiedId === msg.id ? (
                                <Check className="h-3 w-3" aria-hidden="true" />
                              ) : (
                                <Copy className="h-3 w-3" aria-hidden="true" />
                              )}
                            </button>
                            <button
                              onClick={() => sendFeedback(msg.id, 'up')}
                              className={cn(
                                'inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted transition-colors',
                                feedback[msg.id] === 'up'
                                  ? 'text-success bg-success/10'
                                  : 'hover:text-primary',
                              )}
                              aria-label="Thích"
                              aria-pressed={feedback[msg.id] === 'up'}
                              title="Thích"
                            >
                              <ThumbsUp
                                className="h-3 w-3"
                                aria-hidden="true"
                                fill={feedback[msg.id] === 'up' ? 'currentColor' : 'none'}
                              />
                            </button>
                            <button
                              onClick={() => sendFeedback(msg.id, 'down')}
                              className={cn(
                                'inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted transition-colors',
                                feedback[msg.id] === 'down'
                                  ? 'text-destructive bg-destructive/10'
                                  : 'hover:text-primary',
                              )}
                              aria-label="Không thích"
                              aria-pressed={feedback[msg.id] === 'down'}
                              title="Không thích"
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
                                className="inline-flex h-6 items-center gap-1 px-1.5 rounded text-xs hover:bg-muted hover:text-primary transition-colors"
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
                <div className="flex items-start gap-2 justify-start">
                  <div
                    className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="max-w-[80%] rounded-xl rounded-tl-xs px-3 py-2 text-sm bg-card text-foreground border border-border shadow-xs">
                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                      {streamingContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Loading dots */}
              {isLoading && !streamingContent && (
                <div className="flex items-start gap-2 justify-start" aria-hidden="true">
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-card rounded-xl rounded-tl-xs px-3 py-2 border border-border shadow-xs">
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
                className="w-full resize-none rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50 font-medium"
                style={{ minHeight: '40px', maxHeight: '100px' }}
              />
            </div>
            {isLoading ? (
              <Button
                type="button"
                onClick={stopStream}
                size="icon"
                className="h-10 w-10 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground shrink-0 shadow-sm"
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
                className="h-10 w-10 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shrink-0 shadow-sm"
                aria-label="Gửi"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
