'use client';
import { useState } from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSendChatMessage } from '@/hooks/queries';
import { getSafeErrorMessage } from '@/api';

interface MessageInputProps {
  conversationId: string;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const sendMessageMutation = useSendChatMessage();
  const isSending = sendMessageMutation.isPending;
  const [content, setContent] = useState('');

  const handleSend = async () => {
    if (!content.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: content.trim(),
        messageType: 'text',
      });
      setContent('');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể gửi tin nhắn'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-2">
        <button className="p-2 text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted rounded">
          <ImageIcon className="h-5 w-5" />
        </button>
        <Input
          placeholder="Nhập tin nhắn..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!content.trim() || isSending} size="sm" className="">
          {isSending ? (
            <SpinnerLoading noWrapper size={16} className="text-primary-foreground" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
