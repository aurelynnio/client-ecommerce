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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import SpinnerLoading from "@/components/common/SpinnerLoading";
// Updated: Import from voucher types with backward compatibility alias
import { CreateVoucherData } from "@/types/voucher";

interface CreateModelDiscountProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (discountData: CreateVoucherData) => void;
  isLoading: boolean;
}

export function CreateModelDiscount({
  open,
  onOpenChange,
  onCreate,
  isLoading,
}: CreateModelDiscountProps) {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percent",
    discountValue: "",
    startDate: "",
    endDate: "",
    minOrderValue: "",
    usageLimit: "1",
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map old field names to new voucher structure
    const discountData: CreateVoucherData = {
      code: formData.code,
      name: formData.code, // Use code as name for backward compat
      description: formData.description,
      type: formData.discountType === "percent" ? "percentage" : "fixed_amount",
      value: Number(formData.discountValue),
      scope: "platform", // Default to platform scope
      minOrderValue: Number(formData.minOrderValue) || 0,
      usageLimit: Number(formData.usageLimit),
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
    };

    onCreate(discountData);
  };

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percent",
      discountValue: "",
      startDate: "",
      endDate: "",
      minOrderValue: "",
      usageLimit: "1",
      isActive: true,
    });
  };

  const handleOpenChangeWrapper = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeWrapper}>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-border/50 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Tạo mã giảm giá mới
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Nhập thông tin để tạo mã giảm giá mới cho cửa hàng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1 no-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Mã giảm giá *
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  placeholder="VD: GIAMGIA2024"
                  required
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountType" className="text-sm font-medium">
                  Loại giảm giá *
                </Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) => handleChange("discountType", value)}
                >
                  <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    <SelectItem value="percent">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Mô tả mã giảm giá..."
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountValue" className="text-sm font-medium">
                  Giá trị giảm *{" "}
                  {formData.discountType === "percent" ? "(%)" : "(VNĐ)"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    handleChange("discountValue", e.target.value)
                  }
                  placeholder={
                    formData.discountType === "percent" ? "10" : "50000"
                  }
                  min="0"
                  max={formData.discountType === "percent" ? "100" : undefined}
                  required
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit" className="text-sm font-medium">
                  Giới hạn sử dụng *
                </Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => handleChange("usageLimit", e.target.value)}
                  placeholder="100"
                  min="1"
                  required
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Ngày bắt đầu *
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  required
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">
                  Ngày kết thúc *
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  required
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderValue" className="text-sm font-medium">
                Giá trị đơn hàng tối thiểu (VNĐ)
              </Label>
              <Input
                id="minOrderValue"
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => handleChange("minOrderValue", e.target.value)}
                placeholder="0"
                min="0"
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-xl bg-gray-50/50">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-medium cursor-pointer"
              >
                Kích hoạt mã giảm giá
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChangeWrapper(false)}
              disabled={isLoading}
              className="rounded-xl border-gray-200"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-black hover:bg-black/90 text-white dark:bg-[#0071e3] dark:hover:bg-[#0077ED]"
            >
              {isLoading && (
                <SpinnerLoading noWrapper size={16} className="mr-2 text-white" />
              )}
              Tạo mã giảm giá
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
