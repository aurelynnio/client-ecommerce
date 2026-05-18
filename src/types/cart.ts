import { BaseEntity } from "./common";
import { Product, Price, Variant } from "./product";
import { Shop } from "./shop";

// Price type for cart item - can be number (old) or object (new)
// Matches backend Schema.Types.Mixed
export type CartItemPrice = number | Price;

// Cart item interface - matches backend itemSchema
export interface CartItem {
  _id: string;
  productId: Product | string; // Populated or ID
  shopId?: Shop | string; // Optional for backward compatibility

  // Variations
  modelId?: string; // OLD: refers to product.models._id
  variantId?: string; // NEW: refers to product.variants._id (color variant)
  variant?: Variant; // Populated variant info (frontend only)
  size?: string; // NEW: Product-level size selection

  quantity: number;

  // Price can be Number (old) or Object (new) - Schema.Types.Mixed
  price?: CartItemPrice;

  // Frontend/UI only
  selected?: boolean;
}

// Items grouped by shop (Frontend helper)
export interface CartItemsByShop {
  shop: Shop;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// Cart interface - matches backend cartSchema
export interface Cart extends BaseEntity {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  cartCount: number;
}

// Cart state for Redux
export interface CartState {
  data: Cart | null;
  isLoading: boolean;
  error: string | null;
  selectedItems: CartItem[];
  checkoutTotal: number;
  itemsByShop?: CartItemsByShop[]; // Derived state
}

// Add to cart payload
export interface AddToCartPayload {
  productId: string;
  shopId: string;
  variantId?: string;
  modelId?: string;
  quantity: number;
  size?: string;
}

// Update cart item payload
export interface UpdateCartItemPayload {
  itemId: string;
  quantity: number;
}

// Helper to get price value from CartItemPrice (handles both number and object)
export function getCartItemPriceValue(price: CartItemPrice | undefined): number {
  if (price === undefined) return 0;
  if (typeof price === "number") {
    return Number.isFinite(price) ? price : 0;
  }

  const discountPrice = price.discountPrice;
  if (typeof discountPrice === "number" && Number.isFinite(discountPrice)) {
    return discountPrice;
  }

  const currentPrice = price.currentPrice;
  return typeof currentPrice === "number" && Number.isFinite(currentPrice)
    ? currentPrice
    : 0;
}

// Helper function to group cart items by shop
export function groupCartItemsByShop(items: CartItem[]): CartItemsByShop[] {
  const shopMap = new Map<string, CartItemsByShop>();
  const DEFAULT_SHOP_ID = "default-shop";

  items.forEach((item) => {
    let shopId: string = DEFAULT_SHOP_ID;
    let shop: Shop = { _id: DEFAULT_SHOP_ID, name: "Shop" } as unknown as Shop;

    // 1. Try to get shop from populated productId
    if (
      typeof item.productId === "object" &&
      item.productId !== null &&
      "shop" in item.productId
    ) {
      const productShop = item.productId.shop;
      if (
        typeof productShop === "object" &&
        productShop !== null &&
        "name" in productShop
      ) {
        shopId = productShop._id;
        shop = productShop as Shop;
      } else if (typeof productShop === "string") {
        shopId = productShop;
        shop = { _id: shopId, name: "Shop" } as unknown as Shop; // Placeholder
      }
    }

    // 2. Try to get from item.shopId (populated)
    if (
      shopId === DEFAULT_SHOP_ID &&
      typeof item.shopId === "object" &&
      item.shopId !== null &&
      "name" in item.shopId
    ) {
      shopId = item.shopId._id;
      shop = item.shopId as Shop;
    }

    // 3. Try to get from item.shopId (string)
    if (shopId === DEFAULT_SHOP_ID && typeof item.shopId === "string") {
      shopId = item.shopId;
      shop = { _id: shopId, name: "Shop" } as unknown as Shop;
    }

    if (!shopMap.has(shopId)) {
      shopMap.set(shopId, {
        shop,
        items: [],
        subtotal: 0,
        itemCount: 0,
      });
    }

    const group = shopMap.get(shopId)!;
    group.items.push(item);

    // Calculate price - handle both number and object price types
    let price = 0;
    if (item.price !== undefined) {
      price = getCartItemPriceValue(item.price);
    } else if (
      typeof item.productId === "object" &&
      "price" in item.productId &&
      item.productId.price
    ) {
      // Fallback to live product price
      price =
        item.productId.price.discountPrice || item.productId.price.currentPrice;
    }

    group.subtotal += price * item.quantity;
    group.itemCount += item.quantity;
  });

  return Array.from(shopMap.values());
}
