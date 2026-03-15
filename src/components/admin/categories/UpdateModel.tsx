
"use client";
import { useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, X } from "lucide-react";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { Category } from "@/types/category";

// Define Zod validation schema với giá trị mặc định rõ ràng
const formSchema = z.object({
  name: z.string().min(1, { message: "Tên danh mục là bắt buộc" }),
  slug: z
    .string()
    .min(1, { message: "Slug là bắt buộc" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang",
    }),
  description: z.string().default(""),
  isActive: z.boolean().default(true),
});

// Type inference với giá trị mặc định
type FormData = z.infer<typeof formSchema>;

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: FormData & { id: string }) => void;
  category: Category | null;
  isLoading?: boolean;
}

export function EditCategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  isLoading = false,
}: EditCategoryModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as Resolver<FormData>,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
    },
  });


  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        isActive: category.isActive ?? true,
      });
    }
  }, [category, form]);


  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  };

  // Xử lý khi name thay đổi
  const handleNameChange = (name: string) => {
    const currentSlug = form.getValues("slug");
    const originalSlug = category ? generateSlug(category.name || "") : "";


    if (!currentSlug || currentSlug === originalSlug) {
      form.setValue("slug", generateSlug(name), { shouldValidate: true });
    }
  };

  const onSubmit = (data: FormData) => {
    if (!category) return;

    onSave({
      ...data,
      id: category._id as string,
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border/50 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl shadow-2xl p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                Chỉnh sửa danh mục
                <Badge variant="outline" className="text-sm rounded-lg bg-white/50 border-border/50">
                   ID: {category._id?.slice(-4)}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Cập nhật thông tin danh mục sản phẩm
              </DialogDescription>
            </DialogHeader>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Tên danh mục <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên danh mục"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                       className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug Field */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Slug <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ten-danh-muc" 
                      {...field} 
                      className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                    />
                  </FormControl>
                  <FormDescription>
                    SEO URL: /categories/{field.value}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả danh mục"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                      className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Field */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Trạng thái</FormLabel>
                    <div className="flex items-center gap-2">
                       {field.value ? (
                          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Đang hoạt động</Badge>
                       ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">Ngừng hoạt động</Badge>
                       )}
                    </div>
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

            {/* Read-only Information */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                  Ngày tạo
                </FormLabel>
                <p className="text-sm font-medium mt-1">
                  {new Date(category.createdAt || "").toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
              <div>
                <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                  Số lượng sản phẩm
                </FormLabel>
                <p className="text-sm font-medium mt-1">
                  {category.productCount || 0} sản phẩm
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-xl border-gray-200"
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="rounded-xl bg-black hover:bg-black/90 text-white dark:bg-[#0071e3] dark:hover:bg-[#0077ED]"
              >
                {isLoading ? (
                  <SpinnerLoading noWrapper size={16} className="mr-2 text-white" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
