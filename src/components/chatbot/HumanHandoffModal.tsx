'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Headphones, PhoneCall, Mail, MessageSquare, Bot, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface HumanHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HumanHandoffModal({ isOpen, onClose }: HumanHandoffModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-5">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Kết nối Đội ngũ Tư vấn CSKH
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Chúng tôi luôn sẵn sàng hỗ trợ mọi thắc mắc và sự cố đơn hàng của bạn.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2.5 py-2">
          {/* Option 1: Live Chat with Shop */}
          <Link
            href="/seller/chat"
            onClick={onClose}
            className="group flex items-center justify-between rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/50 hover:bg-primary-light"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Kênh Chat Realtime với Cửa hàng
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Trò chuyện trực tiếp 1-1 với nhân viên shop
                </p>
              </div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          {/* Option 2: Hotline */}
          <a
            href="tel:19006868"
            className="group flex items-center justify-between rounded-xl border border-border bg-card p-3 transition-all hover:border-success/50 hover:bg-success/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <PhoneCall className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground group-hover:text-success transition-colors">
                  Tổng đài Hotline 24/7
                </h4>
                <p className="text-[11px] font-semibold text-success">
                  1900 6868 (Miễn phí cước gọi)
                </p>
              </div>
            </div>
            <span className="rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
              Gọi ngay
            </span>
          </a>

          {/* Option 3: Email Support */}
          <a
            href="mailto:cyhincdr@gmail.com?subject=Yêu%20cầu%20hỗ%20trợ%20từ%20khách%20hàng"
            className="group flex items-center justify-between rounded-xl border border-border bg-card p-3 transition-all hover:border-warning/50 hover:bg-warning/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground group-hover:text-warning transition-colors">
                  Hỗ trợ qua Email
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  support@cyhin.engineer • Phản hồi trong 1h
                </p>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground group-hover:text-warning">
              Gửi thư
            </span>
          </a>
        </div>

        <div className="pt-1 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-primary gap-1.5"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Tiếp tục trò chuyện cùng Trợ lý AI Mia</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
