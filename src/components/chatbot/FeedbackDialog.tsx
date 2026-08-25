'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, MessageSquareWarning } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, comment?: string) => Promise<void>;
  isSubmitting?: boolean;
}

const FEEDBACK_REASONS = [
  { id: 'wrong_info', label: '🏷️ Giá hoặc thông tin chưa chính xác' },
  { id: 'broken_link', label: '🔗 Link sản phẩm không hợp lệ / lỗi' },
  { id: 'not_relevant', label: '🎯 Chưa đúng nhu cầu tìm kiếm của tôi' },
  { id: 'confusing', label: '❓ Câu trả lời khó hiểu hoặc quá dài' },
  { id: 'other', label: '💬 Lý do khác' },
];

export default function FeedbackDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: FeedbackDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>(FEEDBACK_REASONS[0].id);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reasonObj = FEEDBACK_REASONS.find((r) => r.id === selectedReason);
    const reasonText = reasonObj ? reasonObj.label : selectedReason;
    await onSubmit(reasonText, comment.trim() || undefined);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-5">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
              <MessageSquareWarning className="h-4 w-4 text-destructive" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Đóng góp ý kiến cho Mia
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Ý kiến của bạn giúp trợ lý AI cải thiện câu trả lời chính xác và hữu ích hơn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Vấn đề bạn gặp phải là gì?
            </label>
            <div className="flex flex-col gap-1.5">
              {FEEDBACK_REASONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedReason(item.id)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium text-left transition-all',
                    selectedReason === item.id
                      ? 'border-primary bg-primary-light text-primary font-semibold'
                      : 'border-border bg-card text-foreground hover:bg-muted/50',
                  )}
                >
                  <span>{item.label}</span>
                  {selectedReason === item.id && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="feedback-comment" className="font-semibold text-foreground">
                Ghi chú thêm (tùy chọn)
              </label>
              <span className="text-[10px] text-muted-foreground">
                {comment.length}/500
              </span>
            </div>
            <Textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Mô tả cụ thể hơn để chúng tôi hỗ trợ bạn tốt nhất..."
              rows={2}
              className="resize-none text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-primary hover:bg-primary-hover text-primary-foreground font-semibold"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi góp ý'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
