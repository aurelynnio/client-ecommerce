'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Folder,
  Calendar,
  Package,
  Link,
  CheckCircle,
  XCircle,
  Edit,
  Layers,
  Image as ImageIcon,
  ZoomIn,
  X,
} from 'lucide-react';
import { Category } from '@/types/category';
import { useState } from 'react';
import Image from 'next/image';
import { formatDate } from '@/utils/format';
import {
  adminDialogContentClass,
  adminInsetPanelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from '@/components/admin/shared/AdminPrimitives';
import { cn } from '@/utils/cn';

interface ViewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (category: Category) => void;
  category: Category | null;
}

const LONG_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export function ViewCategoryModal({ isOpen, onClose, onEdit, category }: ViewCategoryModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!category) return null;

  const handleEdit = () => {
    onEdit(category);
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 rounded-lg px-2.5 py-0.5 shadow-none">
        <CheckCircle className="h-3 w-3 mr-1" />
        Đang hoạt động
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-600 border-0 rounded-lg px-2.5 py-0.5 shadow-none"
      >
        <XCircle className="h-3 w-3 mr-1" />
        Ngừng hoạt động
      </Badge>
    );
  };

  const images = category.images || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={cn(
            adminDialogContentClass,
            'sm:max-w-[700px] max-h-[90vh] overflow-y-auto no-scrollbar p-6',
          )}
        >
          <DialogHeader className="border-b border-border/50 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  Chi tiết danh mục
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  Thông tin và cấu hình cho danh mục này
                </DialogDescription>
              </div>
              {getStatusBadge(category.isActive)}
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-6">
            {/* Header Info */}
            <div className={cn(adminInsetPanelClass, 'flex items-start gap-4 p-5')}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-info/15 text-info">
                <Folder className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="rounded-md border-border bg-card/70 font-mono text-xs text-muted-foreground"
                  >
                    {category.slug}
                  </Badge>
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            {/* Basic Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(adminInsetPanelClass, 'flex flex-col gap-1 p-4')}>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Số lượng sản phẩm
                </span>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-semibold">{category.productCount || 0}</span>
                </div>
              </div>
              <div className={cn(adminInsetPanelClass, 'flex flex-col gap-1 p-4')}>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ngày tạo
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDate(category.createdAt || '', LONG_DATE_OPTIONS)}
                  </span>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Hình ảnh ({images.length})
              </h4>
              {images.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden border border-border/50 cursor-zoom-in group bg-gray-50"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image}
                        alt={`${category.name} - ${index}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-gray-50/30">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">Chưa có hình ảnh</p>
                </div>
              )}
            </div>

            {/* Parent Category & Misc */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Phân cấp & Liên kết
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.parentCategory ? (
                  <div className="p-4 rounded-xl border border-border/50 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-border/30 shadow-sm">
                      <Layers className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold">
                        Danh mục cha
                      </p>
                      <p className="font-medium text-sm">
                        {typeof category.parentCategory === 'object'
                          ? category.parentCategory.name
                          : category.parentCategory}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-border/50 bg-gray-50/50 flex items-center gap-3 opacity-60">
                    <div className="p-2 bg-white rounded-lg border border-border/30">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold">
                        Cấp độ danh mục
                      </p>
                      <p className="font-medium text-sm">Danh mục gốc</p>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl border border-border/50 bg-gray-50/50 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-border/30 shadow-sm">
                    <Link className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase font-bold">
                      URL Công khai
                    </p>
                    <p className="font-medium text-sm truncate text-blue-600 hover:underline cursor-pointer">
                      /categories/{category.slug}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-2 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={cn('h-10 sm:min-w-28', adminSecondaryButtonClass)}
            >
              Đóng
            </Button>
            <Button
              type="button"
              onClick={handleEdit}
              className={cn('h-10 gap-2 px-5 sm:min-w-40', adminPrimaryButtonClass)}
            >
              <Edit className="h-4 w-4" />
              Sửa danh mục
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-screen-lg w-auto bg-transparent border-0 shadow-none p-0 overflow-visible flex items-center justify-center">
            <div className="relative group">
              <Button
                size="icon"
                className="absolute -top-12 right-0 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md border-0"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={selectedImage}
                  alt="Zoomed"
                  width={1000}
                  height={1000}
                  className="max-h-[85vh] w-auto object-contain bg-black/50 backdrop-blur-sm"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
