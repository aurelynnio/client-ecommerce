import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
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
import { Product, VariantFormUpdate } from '@/types/product';
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

interface UpdateModelProductProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onUpdate: (formData: FormData) => void;
  isLoading?: boolean;
}

export function UpdateModelProduct({
  open,
  onOpenChange,
  product,
  onUpdate,
  isLoading = false,
}: UpdateModelProductProps) {
  const { data: categories = [] } = useCategoryTree();
  const { data: myShop } = useMyShop();
  const { data: shopCategoriesData } = useShopCategories(myShop?._id || '', {
    enabled: !!myShop?._id,
  });
  const shopCategories = shopCategoriesData?.categories || [];
  const flatCategories = flattenCategories(categories);

  const productPrice = product?.price || {
    currentPrice: 0,
    discountPrice: 0,
    currency: 'VND',
  };

  const variantsWithFiles: VariantFormUpdate[] = (product?.variants || []).map((v) => ({
    _id: v._id,
    name: v.name,
    color: v.color || '',
    price: v.price,
    stock: v.stock,
    sold: v.sold || 0,
    images: {
      existing: v.images || [],
      newFiles: [],
      newPreviews: [],
    },
  }));

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    slug: product?.slug || '',
    category:
      typeof product?.category === 'string' ? product.category : product?.category?._id || '',
    shopCategory:
      typeof product?.shopCategory === 'string'
        ? product.shopCategory
        : product?.shopCategory?._id || '',
    brand: product?.brand || '',
    status: product?.status || ('published' as 'draft' | 'published' | 'suspended'),
    isNewArrival: product?.isNewArrival || false,
    isFeatured: product?.isFeatured || false,
    price: {
      currentPrice: productPrice.currentPrice ?? 0,
      discountPrice: productPrice.discountPrice ?? 0,
      currency: productPrice.currency ?? 'VND',
    },
    stock: product?.stock || 0,
    weight: product?.weight || 0,
    dimensions: {
      height: product?.dimensions?.height || 0,
      width: product?.dimensions?.width || 0,
      length: product?.dimensions?.length || 0,
    },
    sizes: product?.sizes || [],
    variants: variantsWithFiles,
    attributes: product?.attributes || [],
    tags: product?.tags || [],
    descriptionImages: {
      existing: product?.descriptionImages || [],
      newFiles: [] as File[],
      newPreviews: [] as string[],
    },
  });

  const [newTag, setNewTag] = useState('');
  const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });
  const [newSize, setNewSize] = useState('');

  const addVariant = () => {
    const newVariant: VariantFormUpdate = {
      _id: `temp-${Date.now()}`,
      name: '',
      color: '',
      price: formData.price.currentPrice,
      stock: 0,
      sold: 0,
      images: { existing: [], newFiles: [], newPreviews: [] },
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const updateVariant = (index: number, field: keyof VariantFormUpdate, value: unknown) => {
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
    variant.images.newPreviews.forEach((url) => URL.revokeObjectURL(url));
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
    const totalImages =
      (currentImages?.existing.length || 0) + (currentImages?.newFiles.length || 0) + files.length;
    if (totalImages > 8) {
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
            newFiles: [...v.images.newFiles, ...files],
            newPreviews: [...v.images.newPreviews, ...newPreviews],
          },
        };
      }),
    }));
  };

  const removeExistingVariantImage = (variantIndex: number, imageIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== variantIndex) return v;
        return {
          ...v,
          images: {
            ...v.images,
            existing: v.images.existing.filter((_, idx) => idx !== imageIndex),
          },
        };
      }),
    }));
  };

  const removeNewVariantImage = (variantIndex: number, imageIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== variantIndex) return v;
        URL.revokeObjectURL(v.images.newPreviews[imageIndex]);
        return {
          ...v,
          images: {
            ...v.images,
            newFiles: v.images.newFiles.filter((_, idx) => idx !== imageIndex),
            newPreviews: v.images.newPreviews.filter((_, idx) => idx !== imageIndex),
          },
        };
      }),
    }));
  };

  const handleDescriptionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages =
      formData.descriptionImages.existing.length +
      formData.descriptionImages.newFiles.length +
      files.length;
    if (totalImages > 20) {
      alert('Tối đa 20 ảnh mô tả chi tiết');
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      descriptionImages: {
        ...prev.descriptionImages,
        newFiles: [...prev.descriptionImages.newFiles, ...files],
        newPreviews: [...prev.descriptionImages.newPreviews, ...newPreviews],
      },
    }));
  };

  const removeExistingDescriptionImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      descriptionImages: {
        ...prev.descriptionImages,
        existing: prev.descriptionImages.existing.filter((_, i) => i !== index),
      },
    }));
  };

  const removeNewDescriptionImage = (index: number) => {
    setFormData((prev) => {
      URL.revokeObjectURL(prev.descriptionImages.newPreviews[index]);
      return {
        ...prev,
        descriptionImages: {
          ...prev.descriptionImages,
          newFiles: prev.descriptionImages.newFiles.filter((_, i) => i !== index),
          newPreviews: prev.descriptionImages.newPreviews.filter((_, i) => i !== index),
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
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
    formDataToSend.append('id', product._id);
    const normalizedName = formData.name.trim();
    const normalizedDescription = formData.description.trim();
    const normalizedVariants = formData.variants.map((variant) => ({
      _id: variant._id.startsWith('temp-') ? undefined : variant._id,
      name: variant.name.trim(),
      color: variant.color?.trim() || '',
      price: variant.price,
      stock: variant.stock,
      sold: variant.sold || 0,
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

    if (normalizedName !== product.name) formDataToSend.append('name', normalizedName);
    if (normalizedDescription !== product.description)
      formDataToSend.append('description', normalizedDescription);
    if (formData.slug !== product.slug) formDataToSend.append('slug', formData.slug);

    const originalCategory =
      typeof product.category === 'string' ? product.category : product.category?._id || '';
    if (formData.category !== originalCategory)
      formDataToSend.append('category', formData.category);

    const originalShopCategory =
      typeof product.shopCategory === 'string'
        ? product.shopCategory
        : product.shopCategory?._id || '';
    if (formData.shopCategory !== originalShopCategory)
      formDataToSend.append('shopCategory', formData.shopCategory);

    if (formData.brand !== product.brand) formDataToSend.append('brand', formData.brand);
    if (formData.status !== product.status) formDataToSend.append('status', formData.status);
    if (formData.isNewArrival !== product.isNewArrival)
      formDataToSend.append('isNewArrival', formData.isNewArrival.toString());
    if (formData.isFeatured !== product.isFeatured)
      formDataToSend.append('isFeatured', formData.isFeatured.toString());
    if (aggregatedStock !== product.stock || normalizedVariants.length > 0)
      formDataToSend.append('stock', aggregatedStock.toString());
    if (formData.weight !== product.weight)
      formDataToSend.append('weight', formData.weight.toString());

    const productPrice = product.price || {
      currentPrice: 0,
      discountPrice: 0,
      currency: 'VND',
    };
    if (
      formData.price.currentPrice !== productPrice.currentPrice ||
      formData.price.discountPrice !== productPrice.discountPrice
    ) {
      formDataToSend.append('price', JSON.stringify(formData.price));
    }

    if (JSON.stringify(formData.dimensions) !== JSON.stringify(product.dimensions)) {
      formDataToSend.append('dimensions', JSON.stringify(formData.dimensions));
    }

    formDataToSend.append('variants', JSON.stringify(normalizedVariants));

    if (JSON.stringify(normalizedSizes) !== JSON.stringify(product.sizes || [])) {
      formDataToSend.append('sizes', JSON.stringify(normalizedSizes));
    }

    const existingVariantImagesMapping = formData.variants.map((v, idx) => ({
      variantIndex: idx,
      existing: v.images.existing,
    }));
    formDataToSend.append('existingVariantImages', JSON.stringify(existingVariantImagesMapping));

    formData.variants.forEach((variant, idx) => {
      variant.images.newFiles.forEach((file) => {
        formDataToSend.append(`variantImages_${idx}`, file);
      });
    });

    if (JSON.stringify(normalizedAttributes) !== JSON.stringify(product.attributes)) {
      formDataToSend.append('attributes', JSON.stringify(normalizedAttributes));
    }

    if (JSON.stringify(normalizedTags) !== JSON.stringify(product.tags)) {
      formDataToSend.append('tags', JSON.stringify(normalizedTags));
    }

    const originalDescImages = product.descriptionImages || [];
    const hasDescImageChanges =
      JSON.stringify(formData.descriptionImages.existing) !== JSON.stringify(originalDescImages) ||
      formData.descriptionImages.newFiles.length > 0;

    if (hasDescImageChanges) {
      formDataToSend.append(
        'existingDescriptionImages',
        JSON.stringify(formData.descriptionImages.existing),
      );
      formData.descriptionImages.newFiles.forEach((file) => {
        formDataToSend.append('descriptionImages', file);
      });
    }

    onUpdate(formDataToSend);
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

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] overflow-y-auto rounded-xl border-border bg-card p-6 shadow-lg sm:max-w-[1000px]"
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Cập nhật sản phẩm
              </DialogTitle>
              <DialogDescription className="mt-1 text-muted-foreground">
                Chỉnh sửa thông tin sản phẩm
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={isLoading}
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Slug (URL)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  disabled={isLoading}
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Danh mục <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white">
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
                  <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white">
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
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Mô tả sản phẩm <span className="text-red-500">*</span>
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
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white resize-none"
                minLength={10}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Ảnh mô tả chi tiết
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Tối đa 20 ảnh.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Existing images from server */}
              {formData.descriptionImages.existing.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative w-24 h-24 rounded-xl overflow-hidden border group"
                >
                  <Image src={url} alt={`Mô tả ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingDescriptionImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {/* New images to upload */}
              {formData.descriptionImages.newPreviews.map((preview, index) => (
                <div
                  key={`new-${index}`}
                  className="relative w-24 h-24 rounded-xl overflow-hidden border group border-green-300"
                >
                  <Image
                    src={preview}
                    alt={`Mô tả mới ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 left-1 text-[10px] bg-green-500 text-white px-1 rounded">
                    Mới
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNewDescriptionImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {formData.descriptionImages.existing.length +
                formData.descriptionImages.newFiles.length <
                20 && (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-primary/5">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
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
                <Label className="text-sm font-medium">Giá bán (VND)</Label>
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
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
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
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
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
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
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
                  <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white">
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
              <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-border/50">
                <Switch
                  checked={formData.isNewArrival}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isNewArrival: checked }))
                  }
                  disabled={isLoading}
                />
                <Label className="text-sm font-medium cursor-pointer">Sản phẩm mới</Label>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-border/50">
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
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
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
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
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
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
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
                  className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
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
                  Các biến thể sản phẩm theo màu sắc. SKU tự động tạo.
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
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <Label className="text-sm font-medium text-blue-700">
                Kích thước sản phẩm (áp dụng cho tất cả variants)
              </Label>
              <p className="text-xs text-blue-600 mb-2">VD: S, M, L, XL hoặc 36, 37, 38, 39, 40</p>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  placeholder="Nhập size và nhấn Enter"
                  disabled={isLoading}
                  className="rounded-lg text-sm h-9 bg-white"
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
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-sm"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="text-blue-500 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {formData.variants.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl">
                <p className="text-sm">Chưa có variant nào</p>
                <p className="text-xs mt-1">
                  Nhấn &quot;Thêm variant&quot; để tạo biến thể sản phẩm
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.variants.map((variant, idx) => (
                  <div key={variant._id} className="border rounded-xl p-4 space-y-4 bg-gray-50/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Variant #{idx + 1}
                        {!variant._id.startsWith('temp-') && (
                          <span className="text-xs text-gray-400 ml-2">
                            (ID: {variant._id.slice(-6)})
                          </span>
                        )}
                      </span>
                      <Button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Variant Basic Info - Name and Color only */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Tên hiển thị <span className="text-red-500">*</span>
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
                          className="rounded-lg text-sm h-9"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tồn kho</Label>
                        <Input
                          type="number"
                          value={variant.stock || ''}
                          onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                          className="rounded-lg text-sm h-9"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Variant Images */}
                    <div className="space-y-2">
                      <Label className="text-xs">Ảnh variant (tối đa 8 ảnh)</Label>
                      <div className="flex flex-wrap gap-2">
                        {/* Existing images */}
                        {variant.images.existing.map((url, imgIdx) => (
                          <div
                            key={`existing-${imgIdx}`}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border group"
                          >
                            <Image
                              src={url}
                              alt={`Variant ${idx + 1} - ${imgIdx + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingVariantImage(idx, imgIdx)}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                        {/* New images */}
                        {variant.images.newPreviews.map((preview, imgIdx) => (
                          <div
                            key={`new-${imgIdx}`}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-green-300 group"
                          >
                            <Image
                              src={preview}
                              alt={`New ${imgIdx + 1}`}
                              fill
                              className="object-cover"
                            />
                            <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-green-500 text-white px-1 rounded">
                              Mới
                            </span>
                            <button
                              type="button"
                              onClick={() => removeNewVariantImage(idx, imgIdx)}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                        {variant.images.existing.length + variant.images.newFiles.length < 8 && (
                          <label className="flex size-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-primary/5">
                            <Upload className="h-4 w-4 text-gray-400" />
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

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">
              Thông số kỹ thuật
            </h3>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                value={newAttribute.name}
                onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                placeholder="Tên thông số"
                disabled={isLoading}
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
              />
              <Input
                value={newAttribute.value}
                onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                placeholder="Giá trị"
                disabled={isLoading}
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
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
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-sm"
                  >
                    <span className="font-medium">{attr.name}:</span>
                    <span>{attr.value}</span>
                    <button
                      type="button"
                      onClick={() => removeAttribute(i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
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

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
