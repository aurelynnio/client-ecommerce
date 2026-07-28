/**
 * Payment Constants
 * Centralized payment method and status definitions
 */

/**
 * Payment method constants
 */
export const PAYMENT_METHODS = {
  COD: 'cod',
  VNPAY: 'vnpay',
  MOMO: 'momo',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

/**
 * Payment status constants
 */
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/**
 * Payment method display names (Vietnamese)
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng',
  [PAYMENT_METHODS.VNPAY]: 'VNPay',
  [PAYMENT_METHODS.MOMO]: 'Ví MoMo',
};

/**
 * Payment status display names (Vietnamese)
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.UNPAID]: 'Chưa thanh toán',
  [PAYMENT_STATUS.PAID]: 'Đã thanh toán',
  [PAYMENT_STATUS.REFUNDED]: 'Đã hoàn tiền',
};
