export interface ParsedProduct {
  id: string;
  name: string;
  price?: string;
  originalPrice?: string;
  discountPercent?: number;
  brand?: string;
  category?: string;
  size?: string;
  sizes?: string[];
  colors?: string[];
  image?: string;
  inStock?: boolean;
  productUrl: string;
  checkoutUrl?: string;
  productId?: string;
}

export interface ParsedMessageContent {
  introText: string;
  products: ParsedProduct[];
  outroText: string;
  hasProducts: boolean;
  isComparison?: boolean;
  isSizeAdvice?: boolean;
}

/**
 * Extracts product ID from a checkout URL like /checkout?product=65f123456789...
 */
export function extractProductIdFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const match = url.match(/[?&]product=([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : undefined;
}

const cleanMarkdownBorder = (text: string) =>
  text
    .replace(/^\s*(?:---+|\*\*\*+|___+)\s*/g, '')
    .replace(/\s*(?:---+|\*\*\*+|___+)\s*$/g, '')
    .trim();

/**
 * Parses markdown message from Mia Assistant to identify recommended products
 * and separate conversational text from structured product items.
 */
export function parseProductsFromContent(content: string): ParsedMessageContent {
  if (!content || typeof content !== 'string') {
    return { introText: '', products: [], outroText: '', hasProducts: false };
  }

  const lowerContent = content.toLowerCase();
  const isSizeAdvice =
    lowerContent.includes('bảng size') ||
    lowerContent.includes('chiều cao') ||
    lowerContent.includes('cân nặng') ||
    lowerContent.includes('tư vấn size') ||
    lowerContent.includes('mặc size');

  // Regex to match a single product block formatted by Mia
  // Supports:
  // **[Product Name]**
  // - Giá: 299.000đ (gốc 399.000đ, giảm 25%)
  // - Thương hiệu: Uniqlo
  // - Ảnh: https://... (or ![alt](url))
  // - Size: S, M, L
  // - [Xem chi tiết](...) | [Mua ngay](...)
  const productBlockRegex =
    /(?:^|\n)(?:(?:\d+\.|\*|-)\s*)?\*\*([^*\n]+)\*\*\s*\n([\s\S]*?)(?:[-*]?\s*\[(?:Xem chi tiết|Chi tiết)\]\(([^)]+)\)\s*(?:\||\/|-)?\s*(?:\[(?:Mua ngay|Đặt mua)\]\(([^)]+)\))?)/gi;

  const products: ParsedProduct[] = [];
  let firstProductIndex = -1;
  let lastProductEndIndex = -1;

  let match: RegExpExecArray | null;
  while ((match = productBlockRegex.exec(content)) !== null) {
    const rawName = match[1]?.trim();
    const body = match[2];
    const productUrl = match[3]?.trim() || '';
    const checkoutUrl = match[4]?.trim() || '';

    // Only consider it a product card if it has a valid productUrl and name
    if (rawName && productUrl) {
      if (firstProductIndex === -1) {
        firstProductIndex = match.index;
      }
      lastProductEndIndex = match.index + match[0].length;

      const priceMatch = body.match(/[-*]?\s*(?:\*\*)?Giá(?:\*\*)?:\s*([^\n\r]+)/i);
      const brandMatch = body.match(/[-*]?\s*(?:\*\*)?Thương hiệu(?:\*\*)?:\s*([^\n\r]+)/i);
      const categoryMatch = body.match(/[-*]?\s*(?:\*\*)?Danh mục(?:\*\*)?:\s*([^\n\r]+)/i);
      const statusMatch = body.match(/[-*]?\s*(?:\*\*)?Tình trạng|Còn hàng(?:\*\*)?:\s*([^\n\r]+)/i);
      const sizeMatch = body.match(/[-*]?\s*(?:\*\*)?Size|Kích cỡ(?:\*\*)?:\s*([^\n\r]+)/i);
      const colorMatch = body.match(/[-*]?\s*(?:\*\*)?Màu|Màu sắc(?:\*\*)?:\s*([^\n\r]+)/i);
      const imageMatch =
        body.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/i) ||
        body.match(/[-*]?\s*(?:\*\*)?Ảnh|Image(?:\*\*)?:\s*(https?:\/\/[^\s\n\r]+)/i);

      const rawPrice = priceMatch ? priceMatch[1].trim() : undefined;
      const rawBrand = brandMatch ? brandMatch[1].trim() : undefined;
      const rawCategory = categoryMatch ? categoryMatch[1].trim() : undefined;
      const rawStatus = statusMatch ? statusMatch[1].trim() : undefined;
      const rawSize = sizeMatch ? sizeMatch[1].trim() : undefined;
      const rawColor = colorMatch ? colorMatch[1].trim() : undefined;
      const imageUrl = imageMatch ? imageMatch[1].trim() : undefined;

      const productId = extractProductIdFromUrl(checkoutUrl);

      // Check discount if present in price string (e.g., "299.000đ (gốc 399.000đ, giảm 25%)")
      let price = rawPrice;
      let originalPrice: string | undefined;
      let discountPercent: number | undefined;

      if (rawPrice) {
        const discountMatch = rawPrice.match(
          /(\d+[\d.,]*\s*đ)\s*(?:\(gốc\s*([^,)]+),\s*giảm\s*(\d+)%\))?/i,
        );
        if (discountMatch) {
          price = discountMatch[1];
          originalPrice = discountMatch[2];
          discountPercent = discountMatch[3] ? parseInt(discountMatch[3], 10) : undefined;
        }
      }

      const sizes = rawSize
        ? rawSize
            .split(/[,/|]+/)
            .map((s) => s.trim())
            .filter((s) => s && s.toLowerCase() !== 'n/a')
        : undefined;

      const colors = rawColor
        ? rawColor
            .split(/[,/|]+/)
            .map((c) => c.trim())
            .filter((c) => c && c.toLowerCase() !== 'n/a')
        : undefined;

      products.push({
        id: productId || `prod-${products.length}-${Math.random().toString(36).slice(2, 6)}`,
        name: rawName,
        price,
        originalPrice,
        discountPercent,
        brand: rawBrand && rawBrand !== 'N/A' ? rawBrand : undefined,
        category: rawCategory && rawCategory !== 'N/A' ? rawCategory : undefined,
        size: rawSize && rawSize !== 'N/A' ? rawSize : undefined,
        sizes: sizes && sizes.length > 0 ? sizes : undefined,
        colors: colors && colors.length > 0 ? colors : undefined,
        image: imageUrl,
        inStock: rawStatus ? !rawStatus.toLowerCase().includes('hết') : true,
        productUrl,
        checkoutUrl: checkoutUrl || undefined,
        productId,
      });
    }
  }

  const isComparison =
    products.length >= 2 &&
    (lowerContent.includes('so sánh') ||
      lowerContent.includes('khác nhau') ||
      lowerContent.includes('ưu điểm') ||
      lowerContent.includes('nhược điểm') ||
      lowerContent.includes('nên mua'));

  if (products.length === 0) {
    return {
      introText: content.trim(),
      products: [],
      outroText: '',
      hasProducts: false,
      isComparison: false,
      isSizeAdvice,
    };
  }

  // Split text into intro and outro, cleaning up any markdown boundary delimiters
  const introText =
    firstProductIndex > 0 ? cleanMarkdownBorder(content.slice(0, firstProductIndex)) : '';
  const outroText =
    lastProductEndIndex > 0 && lastProductEndIndex < content.length
      ? cleanMarkdownBorder(content.slice(lastProductEndIndex))
      : '';

  return {
    introText,
    products,
    outroText,
    hasProducts: true,
    isComparison,
    isSizeAdvice,
  };
}
