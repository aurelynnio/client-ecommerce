"use client";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, Trash2 } from "lucide-react";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import Image from "next/image";
import { CreateBannerPayload } from "@/types/banner";


const createBannerSchema = z.object({
  title: z.string().min(1, { message: "Tiêu đề là bắt buộc" }),
  subtitle: z.string().min(1, { message: "Phụ đề là bắt buộc" }),
  imageUrl: z.string().min(1, { message: "Hình ảnh là bắt buộc" }),
  link: z.string().optional(),
  theme: z.enum(["light", "dark"]),
  isActive: z.boolean(),
  order: z.number(),
});

type CreateBannerData = z.infer<typeof createBannerSchema>;

interface CreateBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (bannerData: CreateBannerPayload) => void;
  isLoading?: boolean;
}

export function CreateBannerModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}: CreateBannerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const form = useForm<CreateBannerData>({
    resolver: zodResolver(createBannerSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      link: "",
      theme: "dark",
      isActive: true,
      order: 0,
    },
  });

  // Form reset is handled by mounting/unmounting via 'key' prop in parent

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    form.setValue("imageUrl", previewUrl, { shouldValidate: true });
    // Reset input value to allow re-uploading the same file
    event.target.value = "";
  };

  const removeImage = () => {
    setSelectedFile(null);
    form.setValue("imageUrl", "", { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (data: CreateBannerData) => {
    if (!selectedFile) return;
    onCreate({ ...data, imageFile: selectedFile });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2rem] border-border/50 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl shadow-2xl p-6 sm:max-w-[550px] max-h-[90vh] flex flex-col no-scrollbar">
        <DialogHeader className="shrink-0 pb-6 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            Tạo Banner
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Thiết kế slide mới cho trang chủ
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0 pt-6"
          >
            <div className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Tiêu đề Banner
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Tương lai của sự mượt mà"
                        {...field}
                        className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Phụ đề
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Trải nghiệm bộ sưu tập tối thượng..."
                        {...field}
                        className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Liên kết hành động
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="/shop"
                          {...field}
                          className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Chủ đề văn bản
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50">
                            <SelectValue placeholder="Chọn chủ đề" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="dark">
                            Tối (Chữ trắng)
                          </SelectItem>
                          <SelectItem value="light">
                            Sáng (Chữ đen)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Hình ảnh Slide
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div
                          className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50/50 hover:border-primary/50 transition-all"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          {field.value ? (
                            <div className="relative aspect-[21/9] w-full rounded-lg overflow-hidden border border-border/50 group">
                              <Image
                                src={field.value}
                                alt="Xem trước"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 500px"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage();
                                  }}
                                  className="rounded-full shadow-lg"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Xóa
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="bg-gray-100 p-3 rounded-full mb-3">
                                <Upload className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <p className="text-sm font-medium text-foreground">
                                Nhấn để tải lên hình ảnh banner chất lượng cao
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Thứ tự hiển thị
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl border border-border/50 bg-gray-50/50 p-4 mt-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium block">
                          Trạng thái hoạt động
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="shrink-0 pt-6 border-t border-border/50 gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-xl h-11 border-gray-200"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-xl h-11 bg-black text-white hover:bg-black/90 dark:bg-[#0071e3] shadow-sm"
              >
                {isLoading ? (
                  <SpinnerLoading noWrapper size={16} className="mr-2 text-white" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Tạo Banner
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
