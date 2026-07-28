/**
 * Payment React Query Hooks
 * Replaces paymentAction.ts async thunks with React Query
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import instance from '@/api/api';
import { extractApiData } from '@/api';
import { errorHandler } from '@/services/errorHandler';
import { paymentKeys } from '@/lib/queryKeys';

// ============ Types ============
export interface PaymentUrlResponse {
  paymentUrl: string;
}

export interface PaymentDetails {
  _id: string;
  orderId: string;
  amount: number;
  status: string;
  method: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ API Functions ============
const paymentApi = {
  createUrl: async (orderId: string): Promise<PaymentUrlResponse> => {
    const response = await instance.post('/payment', { orderId });

    return extractApiData(response);
  },

  getByOrder: async (orderId: string): Promise<PaymentDetails> => {
    const response = await instance.get(`/payment/order/${orderId}`);
    return extractApiData(response);
  },
};

// ============ Query Hooks ============

/**
 * Get payment details by order ID
 */
export function usePaymentByOrder(orderId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: paymentKeys.byOrder(orderId),
    queryFn: () => paymentApi.getByOrder(orderId),
    enabled: options?.enabled ?? !!orderId,
  });
}

// ============ Mutation Hooks ============

/**
 * Create VNPay payment URL
 */
export function useCreatePaymentUrl() {
  return useMutation({
    mutationFn: paymentApi.createUrl,
    onError: (error) => {
      errorHandler.log(error, { context: 'Create payment URL failed' });
    },
  });
}
