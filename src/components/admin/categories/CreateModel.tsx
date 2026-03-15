
"use client";
import { useState, useEffect, useRef } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Folder,
  ChevronDown,
  Upload,
  Trash2,
} from "lucide-react";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { Category } from "@/types/category";
import Image from "next/image";


const createFormSchema = z.object({
  name: z.string().min(1, { message: "Tên danh mục là bắt buộc" }),
  slug: z
    .string()
    .min(1, { message: "Slug là bắt buộc" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang",
    }),
  description: z.string().default(""),
  isActive: z.boolean().default(true),
  parentCategory: z.string().default(""),
  images: z.array(z.string()).default([]),
});

type CreateFormData = z.infer<typeof createFormSchema>;

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (categoryData: CreateFormData) => void;
  categories: Category[];
  isLoading?: boolean;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  onCreate,
  categories,
  isLoading = false,
}: CreateCategoryModalProps) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<CreateFormData>({
    resolver: zodResolver(createFormSchema) as Resolver<CreateFormData>,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
      parentCategory: "",
      images: [],
    },
  });


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    if (isOpen) {
      form.reset();
      setIsSlugManuallyEdited(false);
      setIsDropdownOpen(false);
    }
  }, [isOpen, form]);


  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  };


  const handleNameChange = (name: string) => {
    form.setValue("name", name);

    // Only auto-generate slug if it hasn't been manually edited
    if (!isSlugManuallyEdited) {
      form.setValue("slug", generateSlug(name), { shouldValidate: true });
    }
  };


  const handleSlugChange = (slug: string) => {
    form.setValue("slug", slug);
    if (slug && !isSlugManuallyEdited) {
      setIsSlugManuallyEdited(true);
    }
  };


  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const currentImages = form.getValues("images") || [];
      const newImageUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await simulateImageUpload(file);
        newImageUrls.push(imageUrl);
      }

      form.setValue("images", [...currentImages, ...newImageUrls], {
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


  const simulateImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  };


  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("images", newImages, { shouldValidate: true });
  };

  const onSubmit = (data: CreateFormData) => {
    onCreate(data);
  };

  const handleClose = () => {
    form.reset();
    setIsSlugManuallyEdited(false);
    setIsDropdownOpen(false);
    onClose();
  };

  // Get available parent categories
  const availableParentCategories = categories;

  // Get selected category name for display
  const selectedCategory = availableParentCategories.find(
    (cat) => cat._id === form.watch("parentCategory")
  );

  const currentImages = form.watch("images") || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-[2rem] border-border/50 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl shadow-2xl p-6 sm:max-w-[500px] max-h-[90vh] flex flex-col no-scrollbar">
        <DialogHeader className="shrink-0 pb-6 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            Tạo danh mục
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Thêm danh mục sản phẩm mới vào hệ thống
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0 pt-6"
          >
            {/* Scrollable Form Content */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Tên danh mục
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên danh mục"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                        autoFocus
                        className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
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
                      Slug
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ten-danh-muc"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleSlugChange(e.target.value);
                        }}
                        className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                      />
                    </FormControl>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5 ml-1">
                      <span>URL: /categories/{field.value}</span>
                      {!isSlugManuallyEdited && (
                        <Badge variant="outline" className="text-[10px] h-5 rounded-md border-border/50">
                          Tự động
                        </Badge>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parent Category Field */}
              <FormField
                control={form.control}
                name="parentCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Danh mục cha
                    </FormLabel>
                    <FormControl>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 hover:bg-gray-50 transition-all text-left"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                          <span
                            className={
                              field.value
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {selectedCategory
                              ? selectedCategory.name
                              : "Không có danh mục cha"}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 opacity-50 transition-transform ${
                              isDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-border/50 rounded-xl shadow-xl max-h-60 overflow-y-auto no-scrollbar py-1">
                            <div
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-border/50"
                              onClick={() => {
                                field.onChange("");
                                setIsDropdownOpen(false);
                              }}
                            >
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Folder className="h-4 w-4" />
                                <span>Không có danh mục cha</span>
                              </div>
                            </div>

                            {availableParentCategories.map((category) => (
                              <div
                                key={category._id}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-border/50 last:border-b-0"
                                onClick={() => {
                                  field.onChange(category._id);
                                  setIsDropdownOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-2 text-sm">
                                  <Folder className="h-4 w-4 text-blue-500" />
                                  <span className="flex-1 font-medium">
                                    {category.name}
                                  </span>
                                  {category.parentCategory && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] rounded-md h-5"
                                    >
                                      Con
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
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
                        className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Images Field */}
              <FormField
                control={form.control}
                name="images"
                render={({}) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Hình ảnh danh mục
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {/* File Upload Input */}
                        <div
                          className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50/50 hover:border-primary/50 transition-all"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <div className="bg-gray-100 p-3 rounded-full inline-flex mb-3">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {isUploading
                              ? "Đang tải lên..."
                              : "Nhấn để tải hình ảnh"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Kích thước đề xuất: 500x500px
                          </p>
                        </div>

                        {/* Image Preview */}
                        {currentImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-3">
                            {currentImages.map((image, index) => (
                              <div key={index} className="relative aspect-square group rounded-xl overflow-hidden border border-border/50">
                                <Image
                                  src={image}
                                  alt={`Xem trước ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="33vw"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1.5 right-1.5 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 backdrop-blur-sm"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
                  <FormItem className="flex items-center justify-between rounded-xl border border-border/50 bg-gray-50/50 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium block">Trạng thái hoạt động</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Thiết lập hiển thị cho danh mục này
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
            </div>

            {/* Footer */}
            <DialogFooter className="shrink-0 pt-6 border-t border-border/50 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 rounded-xl h-11 border-gray-200"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="flex-1 rounded-xl h-11 bg-black text-white hover:bg-black/90 dark:bg-[#0071e3] shadow-sm"
              >
                {isLoading ? (
                  <SpinnerLoading noWrapper size={16} className="mr-2 text-white" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Tạo danh mục
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
