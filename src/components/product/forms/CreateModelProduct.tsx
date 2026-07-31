import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Trash2, Upload } from 'lucide-react';
import { ProductAttribute, VariantFormCreate } from '@/types/product';
import { TagItem } from '@/components/product/forms/TagItem';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { useCategoryTree } from '@/hooks/queries/useCategories';
import { useMyShop, useShopCategories } from '@/hooks/queries/useShop';
import { flattenCategories } from '@/utils/category';
import { STATUS_OPTIONS } from '@/constants/product';
import { validateProductForm } from '@/utils/productFormValidation';

interface CreateModelProductProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (formData: FormData) => void;
  isLoading?: boolean;
}

const initialFormData = {
  name: '',
  description: '',
  slug: '',
  category: '',
  shopCategory: '',
  brand: '',
  status: 'published' as 'draft' | 'published' | 'suspended',
  isNewArrival: false,
  isFeatured: false,
  price: {
    currentPrice: 0,
    discountPrice: 0,
    currency: 'VND',
  },
  stock: 0,
  weight: 0,
  dimensions: { height: 0, width: 0, length: 0 },
  sizes: [] as string[], // Product-level sizes
  variants: [] as VariantFormCreate[],
  attributes: [] as ProductAttribute[],
  tags: [] as string[],
  descriptionImages: { files: [] as File[], previews: [] as string[] },
};

export function CreateModelProduct({
  open,
  onOpenChange,
  onCreate,
  isLoading = false,
}: CreateModelProductProps) {
  const { data: categories = [] } = useCategoryTree();
  const { data: myShop } = useMyShop();
  const { data: shopCategoriesData } = useShopCategories(myShop?._id || '', {
    enabled: !!myShop?._id,
  });
  const shopCategories = shopCategoriesData?.categories || [];
  const flatCategories = flattenCategories(categories);

  const [formData, setFormData] = useState(initialFormData);
  const [newTag, setNewTag] = useState('');
  const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });
  const [newSize, setNewSize] = useState('');

  const resetForm = () => {
    formData.variants.forEach((v) => {
      v.images.previews.forEach((url) => URL.revokeObjectURL(url));
    });
    formData.descriptionImages.previews.forEach((url) => URL.revokeObjectURL(url));
    setFormData(initialFormData);
    setNewTag('');
    setNewAttribute({ name: '', value: '' });
    setNewSize('');
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const addVariant = () => {
    const newVariant: VariantFormCreate = {
      _id: `temp-${Date.now()}`,
      name: '',
      color: '',
      price: formData.price.currentPrice,
      stock: 0,
      images: { files: [], previews: [] },
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const updateVariant = (index: number, field: keyof VariantFormCreate, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== index) return v;
        return { ...v, [field]: value };
      }),
    }));
  };

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()],
      }));
      setNewSize('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== sizeToRemove),
    }));
  };

  const removeVariant = (index: number) => {
    const variant = formData.variants[index];
    variant.images.previews.forEach((url) => URL.revokeObjectURL(url));
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleVariantImageChange = (
    variantIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentImages = formData.variants[variantIndex]?.images;
    if ((currentImages?.files.length || 0) + files.length > 8) {
      alert('Mỗi variant tối đa 8 ảnh');
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== variantIndex) return v;
        return {
          ...v,
          images: {
            ...v.images,
            files: [...v.images.files, ...files],
            previews: [...v.images.previews, ...newPreviews],
          },
        };
      }),
    }));
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== variantIndex) return v;
        URL.revokeObjectURL(v.images.previews[imageIndex]);
        return {
          ...v,
          images: {
            ...v.images,
            files: v.images.files.filter((_, idx) => idx !== imageIndex),
            previews: v.images.previews.filter((_, idx) => idx !== imageIndex),
          },
        };
      }),
    }));
  };

  const handleDescriptionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.descriptionImages.files.length + files.length > 20) {
      alert('Tối đa 20 ảnh mô tả chi tiết');
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      descriptionImages: {
        files: [...prev.descriptionImages.files, ...files],
        previews: [...prev.descriptionImages.previews, ...newPreviews],
      },
    }));
  };

  const removeDescriptionImage = (index: number) => {
    setFormData((prev) => {
      URL.revokeObjectURL(prev.descriptionImages.previews[index]);
      return {
        ...prev,
        descriptionImages: {
          files: prev.descriptionImages.files.filter((_, i) => i !== index),
          previews: prev.descriptionImages.previews.filter((_, i) => i !== index),
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateProductForm({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      stock: formData.stock,
      weight: formData.weight,
      dimensions: formData.dimensions,
      variants: formData.variants.map((variant) => ({
        name: variant.name,
        price: variant.price,
        stock: variant.stock,
      })),
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const formDataToSend = new FormData();
    const normalizedName = formData.name.trim();
    const normalizedDescription = formData.description.trim();
    const normalizedVariants = formData.variants.map((variant) => ({
      name: variant.name.trim(),
      color: variant.color?.trim() || '',
      price: variant.price,
      stock: variant.stock,
      sold: 0,
    }));
    const normalizedSizes = Array.from(
      new Set(formData.sizes.map((size) => size.trim()).filter(Boolean)),
    );
    const normalizedAttributes = formData.attributes
      .map((attribute) => ({
        name: attribute.name.trim(),
        value: attribute.value.trim(),
      }))
      .filter((attribute) => attribute.name && attribute.value);
    const normalizedTags = Array.from(
      new Set(formData.tags.map((tag) => tag.trim()).filter(Boolean)),
    );
    const aggregatedStock = normalizedVariants.length
      ? normalizedVariants.reduce((sum, variant) => sum + variant.stock, 0)
      : formData.stock;

    formDataToSend.append('name', normalizedName);
    formDataToSend.append('description', normalizedDescription);
    if (formData.slug) formDataToSend.append('slug', formData.slug);
    if (formData.category) formDataToSend.append('category', formData.category);
    if (formData.shopCategory) formDataToSend.append('shopCategory', formData.shopCategory);
    if (formData.brand) formDataToSend.append('brand', formData.brand);
    formDataToSend.append('status', formData.status);
    formDataToSend.append('isNewArrival', formData.isNewArrival.toString());
    formDataToSend.append('isFeatured', formData.isFeatured.toString());
    formDataToSend.append('price', JSON.stringify(formData.price));
    formDataToSend.append('stock', aggregatedStock.toString());
    if (formData.weight) formDataToSend.append('weight', formData.weight.toString());
    if (formData.dimensions.height || formData.dimensions.width || formData.dimensions.length) {
      formDataToSend.append('dimensions', JSON.stringify(formData.dimensions));
    }

    // Process variants
    if (normalizedVariants.length > 0) {
      formDataToSend.append('variants', JSON.stringify(normalizedVariants));

      // Append variant images
      formData.variants.forEach((variant, idx) => {
        variant.images.files.forEach((file) => {
          formDataToSend.append(`variantImages_${idx}`, file);
        });
      });
    }

    if (normalizedSizes.length > 0) {
      formDataToSend.append('sizes', JSON.stringify(normalizedSizes));
    }

    if (normalizedAttributes.length > 0) {
      formDataToSend.append('attributes', JSON.stringify(normalizedAttributes));
    }
    if (normalizedTags.length > 0) {
      formDataToSend.append('tags', JSON.stringify(normalizedTags));
    }

    // Append description images
    if (formData.descriptionImages.files.length > 0) {
      formData.descriptionImages.files.forEach((file) => {
        formDataToSend.append('descriptionImages', file);
      });
    }

    onCreate(formDataToSend);
  };

  const addTag = useCallback(() => {
    if (newTag.trim()) {
      setFormData((prev) => {
        if (prev.tags.includes(newTag.trim())) return prev;
        return { ...prev, tags: [...prev.tags, newTag.trim()] };
      });
      setNewTag('');
    }
  }, [newTag, setFormData, setNewTag]);

  const removeTag = useCallback(
    (tagToRemove: string) => {
      setFormData((prev) => ({
        ...prev,
        tags: prev.tags.filter((tag) => tag !== tagToRemove),
      }));
    },
    [setFormData],
  );

  const addAttribute = () => {
    if (newAttribute.name.trim() && newAttribute.value.trim()) {
      setFormData((prev) => ({
        ...prev,
        attributes: [...prev.attributes, { ...newAttribute }],
      }));
      setNewAttribute({ name: '', value: '' });
    }
  };

  const removeAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl border-border bg-card p-6 sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Tạo sản phẩm mới
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Điền đầy đủ thông tin để tạo sản phẩm
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Tên sản phẩm <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={isLoading}
                  className="rounded-xl border-border bg-muted/30 focus:bg-card"
                  placeholder="VD: Áo thun nam cotton"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Slug (URL)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  disabled={isLoading}
                  className="rounded-xl border-border bg-muted/30 focus:bg-card"
                  placeholder="Để trống sẽ tự tạo từ tên"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Danh mục <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="rounded-xl border-border bg-muted/30 focus:bg-card">
                    <SelectValue placeholder="Chọn danh mục sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Danh mục Shop</Label>
                <Select
                  value={formData.shopCategory}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, shopCategory: value }))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="rounded-xl border-border bg-muted/30 focus:bg-card">
                    <SelectValue placeholder="Chọn danh mục của shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shopCategories
                      .filter((cat) => cat.isActive)
                      .map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Thương hiệu</Label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                  disabled={isLoading}
                  className="rounded-xl border-border bg-muted/30 focus:bg-card"
                  placeholder="VD: Nike, Adidas, Uniqlo"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Mô tả sản phẩm <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                disabled={isLoading}
                className="rounded-xl border-border bg-muted/30 focus:bg-card resize-none"
                placeholder="Mô tả chi tiết về sản phẩm, chất liệu, công dụng..."
                minLength={10}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Ảnh mô tả chi tiết
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Thêm ảnh mô tả chi tiết sản phẩm (tối đa 20 ảnh).
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {formData.descriptionImages.previews.map((preview, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-xl overflow-hidden border group"
                >
                  <Image src={preview} alt={`Mô tả ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeDescriptionImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {formData.descriptionImages.files.length < 20 && (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-primary/5">
                  <Upload className="h-6 w-6 text-muted-foreground/60" />
                  <span className="text-xs text-muted-foreground/60 mt-1">Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDescriptionImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">
              Giá & Trạng thái
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Giá bán (VND) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  value={formData.price.currentPrice || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: {
                        ...prev.price,
                        currentPrice: Number(e.target.value),
                      },
                    }))
                  }
                  disabled={isLoading}
                  className="rounded-xl border-border bg-muted/30 focus:bg-card"
                  placeholder="150000"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Giá khuyến mãi</Label>
                <Input
                  type="number"
                  value={formData.price.discountPrice || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: {
                        ...prev.price,
                        discountPrice: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  disabled={isLoading}
                  className="rounded-xl border-border bg-muted/30 focus:bg-card"
                  placeholder="120000"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tồn kho</Label>
                <Input
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stock: Number(e.target.value),
                    }))
                  }
                  disabled={isLoading}
                  className="rounded-xl border-border bg-muted/30 focus:bg-card"
                  placeholder="100"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value as typeof formData.status,
                    }))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="rounded-xl border-border bg-muted/30 focus:bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                <Switch
                  checked={formData.isNewArrival}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isNewArrival: checked }))
                  }
                  disabled={isLoading}
                />
                <Label className="text-sm font-medium cursor-pointer">Sản phẩm mới</Label>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isFeatured: checked }))
                  }
                  disabled={isLoading}
                />
                <Label className="text-sm font-medium cursor-pointer">Sản phẩm nổi bật</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">
              Thông tin vận chuyển
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cân nặng (gram)</Label>
                <Input
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      weight: Number(e.target.value),
                    }))
                  }
                  disabled={isLoading}
                  className="rounded-xl border-border bg-muted/30 focus:bg-card"
                  placeholder="500"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Dài (cm)</Label>
                <Input
                  type="number"
                  value={formData.dimensions.length || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dimensions: {
                        ...prev.dimensions,
                        length: Number(e.target.value),
                      },
                    }))
                  }
                  disabled={isLoading}
                  className="rounded-xl border-border bg-muted/30 focus:bg-card"
                  placeholder="30"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rộng (cm)</Label>
                <Input
                  type="number"
                  value={formData.dimensions.width || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dimensions: {
                        ...prev.dimensions,
                        width: Number(e.target.value),
                      },
                    }))
                  }
                  disabled={isLoading}
                  className="rounded-xl border-border bg-muted/30 focus:bg-card"
                  placeholder="20"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cao (cm)</Label>
                <Input
                  type="number"
                  value={formData.dimensions.height || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dimensions: {
                        ...prev.dimensions,
                        height: Number(e.target.value),
                      },
                    }))
                  }
                  disabled={isLoading}
                  className="rounded-xl border-border bg-muted/30 focus:bg-card"
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="space-y-4">
            <div className="border-b pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Phân loại hàng (Variants)
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Thêm các biến thể sản phẩm theo màu sắc. SKU sẽ được tự động tạo.
                </p>
              </div>
              <Button
                type="button"
                onClick={addVariant}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="rounded-xl"
              >
                <Plus className="h-4 w-4 mr-1" /> Thêm variant
              </Button>
            </div>

            {/* Product-level Sizes */}
            <div className="p-4 bg-info/15 rounded-xl border border-border/50">
              <Label className="text-sm font-medium text-info">
                Kích thước sản phẩm (áp dụng cho tất cả variants)
              </Label>
              <p className="text-xs text-info mb-2">VD: S, M, L, XL hoặc 36, 37, 38, 39, 40</p>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  placeholder="Nhập size và nhấn Enter"
                  disabled={isLoading}
                  className="rounded-lg text-sm h-9 bg-card"
                />
                <Button
                  type="button"
                  onClick={addSize}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.sizes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center gap-1 bg-info/15 text-info px-2 py-1 rounded-lg text-sm"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="text-info hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {formData.variants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground/60 border-2 border-dashed rounded-xl">
                <p className="text-sm">Chưa có variant nào</p>
                <p className="text-xs mt-1">
                  Nhấn &quot;Thêm variant&quot; để tạo biến thể sản phẩm
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.variants.map((variant, idx) => (
                  <div key={variant._id} className="border rounded-xl p-4 space-y-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Variant #{idx + 1}</span>
                      <Button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/15"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Variant Basic Info - Name and Color only */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Tên hiển thị <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={variant.name}
                          onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                          placeholder="VD: Đỏ, Xanh Navy, Đen"
                          className="rounded-lg text-sm h-9"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Màu sắc</Label>
                        <Input
                          value={variant.color}
                          onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                          placeholder="VD: Đỏ, Xanh, Đen"
                          className="rounded-lg text-sm h-9"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Variant Price & Stock */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Giá (VND)</Label>
                        <Input
                          type="number"
                          value={variant.price || ''}
                          onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                          placeholder="150000"
                          className="rounded-lg text-sm h-9"
                          disabled={isLoading}
                          min="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tồn kho</Label>
                        <Input
                          type="number"
                          value={variant.stock || ''}
                          onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                          placeholder="100"
                          className="rounded-lg text-sm h-9"
                          disabled={isLoading}
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Variant Images */}
                    <div className="space-y-2">
                      <Label className="text-xs">Ảnh variant (tối đa 8 ảnh)</Label>
                      <div className="flex flex-wrap gap-2">
                        {variant.images.previews.map((preview, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border group"
                          >
                            <Image
                              src={preview}
                              alt={`Variant ${idx + 1} - ${imgIdx + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeVariantImage(idx, imgIdx)}
                              className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                        {variant.images.files.length < 8 && (
                          <label className="flex size-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-primary/5">
                            <Upload className="h-4 w-4 text-muted-foreground/60" />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleVariantImageChange(idx, e)}
                              className="hidden"
                              disabled={isLoading}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attributes Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">
              Thông số kỹ thuật
            </h3>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                value={newAttribute.name}
                onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                placeholder="Tên thông số (VD: Chất liệu)"
                disabled={isLoading}
                className="rounded-xl border-border bg-muted/30 focus:bg-card"
              />
              <Input
                value={newAttribute.value}
                onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                placeholder="Giá trị (VD: Cotton 100%)"
                disabled={isLoading}
                className="rounded-xl border-border bg-muted/30 focus:bg-card"
              />
              <Button
                type="button"
                onClick={addAttribute}
                disabled={isLoading}
                variant="outline"
                className="rounded-xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.attributes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.attributes.map((attr, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-sm"
                  >
                    <span className="font-medium">{attr.name}:</span>
                    <span>{attr.value}</span>
                    <button
                      type="button"
                      onClick={() => removeAttribute(i)}
                      className="text-muted-foreground/60 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">
              Tags
            </h3>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Nhập tag và nhấn Enter"
                disabled={isLoading}
                className="rounded-xl border-border bg-muted/30 focus:bg-card"
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={isLoading}
                variant="outline"
                className="rounded-xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <TagItem key={tag} tag={tag} onRemove={removeTag} />
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-primary hover:bg-primary-hover"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
