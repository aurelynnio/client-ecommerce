'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, RotateCcw, Search, X } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
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

const CHATBOT_API_BASE_URL = api.defaults.baseURL || '/api';

// Extended ChatbotMessage with Date timestamp for local state
interface Message extends Omit<ChatbotMessage, 'timestamp'> {
  timestamp: Date;
}

const QUICK_ACTIONS = [
  {
    icon: <Search className="h-4 w-4" />,
    label: 'Tìm sản phẩm',
    query: 'Tìm sản phẩm',
  },
  { icon: '🏷️', label: 'Khuyến mãi', query: 'Sản phẩm đang giảm giá' },
  { icon: '🔥', label: 'Bán chạy', query: 'Sản phẩm bán chạy nhất' },
  { icon: '👕', label: 'Thời trang', query: 'Gợi ý thời trang' },
];

export default function ChatWidget() {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector((state) => state.chat);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('chatbot_session');
    if (savedSession) {
      setSessionId(savedSession);
      loadHistory(savedSession);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Focus trap, scroll-lock, and focus restore implementation
  useEffect(() => {
    if (isOpen) {
      // Store current active element to restore later
      triggerRef.current = document.activeElement as HTMLElement;

      // The desktop drawer overlays content; only the full-screen mobile panel
      // locks the document scroll.
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) document.body.style.overflow = 'hidden';

      // Set focus to the input field or first item
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      // Unlock body scroll
      document.body.style.overflow = '';

      // Restore focus
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key & outside click listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        dispatch(setChatOpen(false));
      }

      // Simple Focus Trap loop on Tab key
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex="0"]',
        );
        if (!focusableElements.length) return;
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, dispatch]);

  const loadHistory = async (sid: string) => {
    try {
      const res = await fetch(`${CHATBOT_API_BASE_URL}${ENDPOINT_CHATBOT.history(sid)}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.status === 'success' && data.data?.messages) {
        setMessages(
          data.data.messages.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        );
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = {
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setStreamingContent('');

      // Hard timeout cho stream: nếu quá 45s không có token mới → huỷ và báo lỗi
      const STREAM_TIMEOUT_MS = 45_000;
      let streamTimer: ReturnType<typeof setTimeout> | null = null;
      let timedOut = false;
      let controller: AbortController | null = null;

      const armTimer = () => {
        if (streamTimer) clearTimeout(streamTimer);
        streamTimer = setTimeout(() => {
          timedOut = true;
          controller?.abort();
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: '⚠️ Phản hồi quá lâu, vui lòng thử lại.',
              timestamp: new Date(),
            },
          ]);
          setStreamingContent('');
          setIsLoading(false);
        }, STREAM_TIMEOUT_MS);
      };
      const disarmTimer = () => {
        if (streamTimer) {
          clearTimeout(streamTimer);
          streamTimer = null;
        }
      };

      try {
        controller = new AbortController();
        const res = await fetch(`${CHATBOT_API_BASE_URL}${ENDPOINT_CHATBOT.STREAM}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.trim(), sessionId }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Stream request failed');
        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        armTimer();

        while (true) {
          if (timedOut) break;
          const { done, value } = await reader.read();
          if (done) break;

          armTimer(); // reset mỗi khi có data
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'session' && data.sessionId) {
                  if (data.sessionId !== sessionId) {
                    setSessionId(data.sessionId);
                    localStorage.setItem('chatbot_session', data.sessionId);
                  }
                } else if (data.type === 'token') {
                  fullContent += data.content;
                  setStreamingContent(fullContent);
                } else if (data.type === 'done') {
                  setMessages((prev) => [
                    ...prev,
                    {
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
                console.error('Invalid JSON:', e);
              }
            }
          }
        }
      } catch (error) {
        if (timedOut) {
          // đã xử lý trong timer
        } else {
          console.error('Chat error:', error);
          setStreamingContent('');
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'Xin lỗi, không thể kết nối. Vui lòng thử lại!',
              timestamp: new Date(),
            },
          ]);
        }
      } finally {
        disarmTimer();
        setIsLoading(false);
      }
    },
    [isLoading, sessionId],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setStreamingContent('');
    localStorage.removeItem('chatbot_session');
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Đóng Mia - Trợ lý AI"
          className="fixed inset-0 z-40 cursor-default bg-black/20"
          onClick={() => dispatch(setChatOpen(false))}
        />
      )}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mia - AI Chat Assistant"
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
            <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
            <span className="text-xs font-medium text-muted-foreground">Mia sẵn sàng hỗ trợ</span>
          </div>
          <button
            onClick={() => dispatch(setChatOpen(false))}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <X className="w-3 h-3" />
            <span>Đóng</span>
          </button>
        </div>

        {/* Header Info */}
        <div className="bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Mia - Trợ lý AI</h3>
                <p className="text-xs text-muted-foreground">Hỗ trợ mua sắm</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                title="Làm mới"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="min-h-0 flex-1 overflow-y-auto bg-muted/20"
          ref={scrollRef}
          style={{ overscrollBehavior: 'contain' }}
        >
          {messages.length === 0 && !streamingContent ? (
            <div className="p-4 space-y-4">
              {/* Welcome Card */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                <p className="text-sm text-foreground mb-1">
                  <span className="font-bold text-primary">Xin chào! 👋</span>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Em là trợ lý mua sắm AI, có thể giúp bạn tìm kiếm sản phẩm, tư vấn thời trang,
                  hoặc trả lời các câu hỏi về đơn hàng.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action.query)}
                    className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl hover:bg-primary-light transition-colors text-left group"
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
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-2',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
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
                      <div className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>li]:mb-0.5 text-foreground prose-a:text-primary hover:prose-a:underline font-medium">
                        <ReactMarkdown
                          rehypePlugins={[rehypeSanitize]}
                          components={{
                            a: ({ href, children }) => {
                              if (!href) return <span>{children}</span>;

                              // Check if link is internal (starts with / or current domain)
                              const isInternal = href.startsWith('/');

                              if (isInternal) {
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
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming */}
              {streamingContent && (
                <div className="flex items-start gap-2 justify-start">
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="max-w-[80%] rounded-xl rounded-tl-xs px-3 py-2 text-sm bg-card text-foreground border border-border shadow-xs">
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoading && !streamingContent && (
                <div className="flex items-start gap-2 justify-start">
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

        {/* Input Area - Flow layout composer for preventing mobile keyboard issues */}
        <div className="sticky bottom-0 mt-auto border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                rows={1}
                className="w-full resize-none rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50 font-medium"
                style={{ minHeight: '40px', maxHeight: '100px' }}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shrink-0 shadow-sm"
            >
              {isLoading ? <SpinnerLoading size={16} noWrapper /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
