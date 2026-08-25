export interface ParsedProduct {
  id: string;
  name: string;
  price?: string;
  originalPrice?: string;
  discountPercent?: number;
  brand?: string;
  category?: string;
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
}

/**
 * Extracts product ID from a checkout URL like /checkout?product=65f123456789...
 */
export function extractProductIdFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const match = url.match(/[?&]product=([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : undefined;
}

/**
 * Parses markdown message from Mia Assistant to identify recommended products
 * and separate conversational text from structured product items.
 */
export function parseProductsFromContent(content: string): ParsedMessageContent {
  if (!content || typeof content !== 'string') {
    return { introText: '', products: [], outroText: '', hasProducts: false };
  }

  // Regex to match a single product block formatted by Mia
  // Example:
  // **Áo Thun Basic Cotton**
  // - Giá: 299.000đ
  // - Thương hiệu: Uniqlo
  // - [Xem chi tiết](/products/ao-thun-basic-cotton) | [Mua ngay](/checkout?product=123)
  const productBlockRegex =
    /(?:^|\n)(?:(?:\d+\.|\*|-)\s*)?\*\*([^*\n]+)\*\*\s*(?:\n\s*[-*]\s*Giá:\s*([^\n\r]+))?(?:\n\s*[-*]\s*Thương hiệu:\s*([^\n\r]+))?(?:\n\s*[-*]\s*Danh mục:\s*([^\n\r]+))?(?:\n\s*[-*]\s*Tình trạng:\s*([^\n\r]+))?\s*\n\s*[-*]?\s*\[(?:Xem chi tiết|Chi tiết)\]\(([^)]+)\)\s*(?:\||\/|-)?\s*(?:\[(?:Mua ngay|Đặt mua)\]\(([^)]+)\))?/gi;

  const products: ParsedProduct[] = [];
  let firstProductIndex = -1;
  let lastProductEndIndex = -1;

  let match: RegExpExecArray | null;
  while ((match = productBlockRegex.exec(content)) !== null) {
    const rawName = match[1]?.trim();
    const rawPrice = match[2]?.trim();
    const rawBrand = match[3]?.trim();
    const rawCategory = match[4]?.trim();
    const rawStatus = match[5]?.trim();
    const productUrl = match[6]?.trim() || '';
    const checkoutUrl = match[7]?.trim() || '';

    // Only consider it a product card if it has a productUrl
    if (rawName && productUrl) {
      if (firstProductIndex === -1) {
        firstProductIndex = match.index;
      }
      lastProductEndIndex = match.index + match[0].length;

      const productId = extractProductIdFromUrl(checkoutUrl);

      // Check discount if present in price string (e.g., "299.000đ (gốc 399.000đ, giảm 25%)")
      let price = rawPrice;
      let originalPrice: string | undefined;
      let discountPercent: number | undefined;

      if (rawPrice) {
        const discountMatch = rawPrice.match(/(\d+[\d.,]*\s*đ)\s*(?:\(gốc\s*([^,)]+),\s*giảm\s*(\d+)%\))?/i);
        if (discountMatch) {
          price = discountMatch[1];
          originalPrice = discountMatch[2];
          discountPercent = discountMatch[3] ? parseInt(discountMatch[3], 10) : undefined;
        }
      }

      products.push({
        id: productId || `prod-${products.length}-${Math.random().toString(36).slice(2, 6)}`,
        name: rawName,
        price,
        originalPrice,
        discountPercent,
        brand: rawBrand && rawBrand !== 'N/A' ? rawBrand : undefined,
        category: rawCategory && rawCategory !== 'N/A' ? rawCategory : undefined,
        inStock: rawStatus ? !rawStatus.toLowerCase().includes('hết') : true,
        productUrl,
        checkoutUrl: checkoutUrl || undefined,
        productId,
      });
    }
  }

  // Fallback pattern if format is slightly different (e.g. single product link format)
  if (products.length === 0) {
    const linkPairRegex =
      /\[(?:Xem chi tiết|Chi tiết)\]\((\/products\/[^)]+)\)\s*(?:\||\/|-)\s*\[(?:Mua ngay|Đặt mua)\]\((\/checkout[^)]+)\)/gi;
    let linkMatch: RegExpExecArray | null;
    let idx = 0;
    while ((linkMatch = linkPairRegex.exec(content)) !== null) {
      const pUrl = linkMatch[1];
      const cUrl = linkMatch[2];
      const pId = extractProductIdFromUrl(cUrl);
      const slugName = pUrl.replace('/products/', '').replace(/-/g, ' ');
      const capitalized = slugName.charAt(0).toUpperCase() + slugName.slice(1);

      products.push({
        id: pId || `prod-fallback-${idx++}`,
        name: capitalized,
        productUrl: pUrl,
        checkoutUrl: cUrl,
        productId: pId,
      });
    }
  }

  if (products.length === 0) {
    return {
      introText: content.trim(),
      products: [],
      outroText: '',
      hasProducts: false,
    };
  }

  // Split text into intro and outro
  const introText =
    firstProductIndex > 0 ? content.slice(0, firstProductIndex).trim() : '';
  const outroText =
    lastProductEndIndex > 0 && lastProductEndIndex < content.length
      ? content.slice(lastProductEndIndex).trim()
      : '';

  return {
    introText,
    products,
    outroText,
    hasProducts: true,
  };
}
