import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SpinnerLoading from "@/components/common/SpinnerLoading";

import { NotificationType } from "@/types/notification";

export interface CreateNotificationForm {
  title: string;
  message: string;
  type: NotificationType;
  link: string;
  recipient: string;
}

interface CreateNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreateNotificationForm) => void;
  isLoading: boolean;
}

export function CreateNotificationModal({
  open,
  onOpenChange,
  onCreate,
  isLoading,
}: CreateNotificationModalProps) {
  const [formData, setFormData] = useState<CreateNotificationForm>({
    title: "",
    message: "",
    type: "system",
    link: "",
    recipient: "",
  });

  const handleChange = (field: keyof CreateNotificationForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  const handleOpenChangeWrapper = (open: boolean) => {
    if (!open) {
        setFormData({
          title: "",
          message: "",
          type: "system",
          link: "",
          recipient: "",
        });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeWrapper}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border/50 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">Tạo thông báo</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Gửi thông báo mới đến người dùng hoặc toàn hệ thống.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Tiêu đề *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Tiêu đề thông báo"
              required
              className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">Loại *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all">
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50">
                <SelectItem value="system">Hệ thống</SelectItem>
                <SelectItem value="order_status">Đơn hàng</SelectItem>
                <SelectItem value="chat">Trò chuyện</SelectItem>
                <SelectItem value="shop_follow">Theo dõi shop</SelectItem>
                <SelectItem value="promotion">Khuyến mãi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Nội dung *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Nội dung thông báo..."
              required
              className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all resize-none min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="recipient" className="text-sm font-medium">ID Người dùng (Tùy chọn)</Label>
                <Input
                id="recipient"
                value={formData.recipient}
                onChange={(e) => handleChange("recipient", e.target.value)}
                placeholder="Nhập ID người dùng cụ thể"
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="link" className="text-sm font-medium">Liên kết (Tùy chọn)</Label>
                <Input
                id="link"
                value={formData.link}
                onChange={(e) => handleChange("link", e.target.value)}
                placeholder="/products/..."
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChangeWrapper(false)}
              disabled={isLoading}
              className="rounded-xl border-gray-200"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl bg-black hover:bg-black/90 text-white dark:bg-[#0071e3] dark:hover:bg-[#0077ED]">
              {isLoading && (
                <SpinnerLoading noWrapper size={16} className="mr-2 text-white" />
              )}
              Gửi thông báo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
