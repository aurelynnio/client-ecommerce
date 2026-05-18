interface ProductPriceValidation {
  currentPrice: number;
  discountPrice?: number | null;
}

interface ProductDimensionsValidation {
  height?: number;
  width?: number;
  length?: number;
}

interface ProductVariantValidation {
  name: string;
  price: number;
  stock: number;
}

export interface ProductFormValidationInput {
  name: string;
  description: string;
  category: string;
  price: ProductPriceValidation;
  stock: number;
  weight?: number;
  dimensions?: ProductDimensionsValidation;
  variants: ProductVariantValidation[];
}

function isNegativeNumber(value: number | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value) && value < 0;
}

export function validateProductForm(
  formData: ProductFormValidationInput,
): string | null {
  if (formData.name.trim().length < 3) {
    return "Tên sản phẩm phải có ít nhất 3 ký tự.";
  }

  if (formData.description.trim().length < 10) {
    return "Mô tả sản phẩm phải có ít nhất 10 ký tự.";
  }

  if (!formData.category) {
    return "Vui lòng chọn danh mục sản phẩm.";
  }

  if (
    !Number.isFinite(formData.price.currentPrice) ||
    formData.price.currentPrice < 0
  ) {
    return "Giá bán không hợp lệ.";
  }

  if (
    formData.price.discountPrice !== undefined &&
    formData.price.discountPrice !== null
  ) {
    if (
      !Number.isFinite(formData.price.discountPrice) ||
      formData.price.discountPrice < 0
    ) {
      return "Giá khuyến mãi không hợp lệ.";
    }

    if (
      formData.price.discountPrice > 0 &&
      formData.price.discountPrice >= formData.price.currentPrice
    ) {
      return "Giá khuyến mãi phải nhỏ hơn giá bán.";
    }
  }

  if (!Number.isInteger(formData.stock) || formData.stock < 0) {
    return "Tồn kho phải là số nguyên không âm.";
  }

  if (isNegativeNumber(formData.weight)) {
    return "Cân nặng không được âm.";
  }

  if (
    isNegativeNumber(formData.dimensions?.height) ||
    isNegativeNumber(formData.dimensions?.width) ||
    isNegativeNumber(formData.dimensions?.length)
  ) {
    return "Kích thước không được âm.";
  }

  for (const [index, variant] of formData.variants.entries()) {
    if (!variant.name.trim()) {
      return `Variant #${index + 1} đang thiếu tên hiển thị.`;
    }

    if (!Number.isFinite(variant.price) || variant.price < 0) {
      return `Giá của variant #${index + 1} không hợp lệ.`;
    }

    if (!Number.isInteger(variant.stock) || variant.stock < 0) {
      return `Tồn kho của variant #${index + 1} phải là số nguyên không âm.`;
    }
  }

  return null;
}
