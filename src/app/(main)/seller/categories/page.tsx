'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Tag, Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  useMyShopCategories,
  useCreateShopCategory,
  useUpdateShopCategory,
  useDeleteShopCategory,
} from '@/hooks/queries';
import { ShopCategory, CreateShopCategoryPayload } from '@/types/shopCategory';
import { getSafeErrorMessage } from '@/api';

export default function SellerCategoriesPage() {
  const { data: categories = [], isLoading } = useMyShopCategories();
  const createMutation = useCreateShopCategory();
  const updateMutation = useUpdateShopCategory();
  const deleteMutation = useDeleteShopCategory();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateShopCategoryPayload>({
    name: '',
    description: '',
    image: '',
    sortOrder: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          categoryId: editingId,
          data: formData,
        });
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Tạo danh mục thành công!');
      }
      resetForm();
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Thao tác thất bại'));
    }
  };

  const handleEdit = (category: ShopCategory) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Xóa danh mục thành công!');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Xóa danh mục thất bại'));
    }
  };

  const handleToggleActive = async (category: ShopCategory) => {
    try {
      await updateMutation.mutateAsync({
        categoryId: category._id,
        data: { isActive: !category.isActive },
      });
      toast.success(category.isActive ? 'Đã ẩn danh mục' : 'Đã hiện danh mục');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Cập nhật thất bại'));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', image: '', sortOrder: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Danh mục Shop</h1>
            <p className="text-sm text-muted-foreground">Quản lý danh mục sản phẩm của shop</p>
          </div>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90 rounded-xl h-11 px-5 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm danh mục
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">
              {editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={resetForm}
              className="rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Tên danh mục *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Điện thoại"
                  className="mt-1.5 h-11 rounded-xl border-0 bg-card"
                />
              </div>
              <div>
                <Label className="text-foreground">Thứ tự hiển thị</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: Number(e.target.value),
                    })
                  }
                  className="mt-1.5 h-11 rounded-xl border-0 bg-card"
                />
              </div>
            </div>
            <div>
              <Label className="text-foreground">Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn về danh mục"
                rows={2}
                className="mt-1.5 rounded-xl resize-none border-0 bg-card"
              />
            </div>
            <div>
              <Label className="text-foreground">URL hình ảnh</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                className="mt-1.5 h-11 rounded-xl border-0 bg-card"
              />
              {formData.image ? (
                <div className="relative mt-3 w-16 h-16 rounded-lg overflow-hidden border border-border bg-card">
                  <Image
                    src={formData.image}
                    alt="Category preview"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 rounded-xl h-11 px-5"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <SpinnerLoading size={16} className="mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingId ? 'Cập nhật' : 'Tạo danh mục'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="rounded-xl h-11 border-0 bg-card"
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <SpinnerLoading size={32} />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Chưa có danh mục nào</h3>
            <p className="mb-6 text-sm text-muted-foreground">Tạo danh mục để phân loại sản phẩm</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm danh mục đầu tiên
            </Button>
          </div>
        ) : (
          <div>
            {categories.map((category, idx) => (
              <div
                key={category._id}
                className={`p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
                  idx % 2 === 0 ? 'bg-card' : 'bg-card/50'
                } ${!category.isActive && 'opacity-60'}`}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                  <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
                    {category.sortOrder}
                  </div>
                  <div>
                    <h3
                      className={`font-medium ${
                        category.isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {category.description && (
                        <span className="text-xs text-muted-foreground">
                          {category.description}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        • {category.productCount} sản phẩm
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:justify-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {category.isActive ? 'Hiện' : 'Ẩn'}
                    </span>
                    <Switch
                      checked={category.isActive}
                      onCheckedChange={() => handleToggleActive(category)}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                      className="h-9 w-9 rounded-lg"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category._id)}
                      disabled={deleteMutation.isPending}
                      className="h-9 w-9 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
