/**
 * Shipmondo React Query hooks
 * Quotes for checkout, shipment booking, shipment info and sales-order sync.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { ENDPOINT_SHIPMONDO } from '@/constants/endpoint';
import { extractApiData } from '@/api';
import { shipmondoKeys, orderKeys } from '@/lib/queryKeys';
import { STALE_TIME } from '@/constants/cache';
import { errorHandler } from '@/lib/error-handler';
import {
  ShipmondoQuote,
  ShipmondoQuoteRequest,
  ShipmondoShipmentInfo,
  ShippingOption,
} from '@/types/shipmondo';
import { Order } from '@/types/order';

const shipmondoApi = {
  getQuotes: async (data: ShipmondoQuoteRequest): Promise<ShipmondoQuote[]> => {
    const response = await instance.post(ENDPOINT_SHIPMONDO.QUOTES, data);
    const result = extractApiData<{ quotes: ShipmondoQuote[] }>(response);
    return result?.quotes || [];
  },

  createShipment: async (data: {
    orderId: string;
    productCode?: string;
    serviceCodes?: string[];
    printLabel?: boolean;
  }): Promise<{ order: Order; shipment: unknown }> => {
    const response = await instance.post(ENDPOINT_SHIPMONDO.SHIPMENTS, data);
    return extractApiData(response);
  },

  getOrderShipment: async (orderId: string): Promise<ShipmondoShipmentInfo> => {
    const response = await instance.get(ENDPOINT_SHIPMONDO.orderShipment(orderId));
    return extractApiData(response);
  },

  syncSalesOrder: async (orderId: string): Promise<{ order: Order }> => {
    const response = await instance.post(ENDPOINT_SHIPMONDO.orderSalesOrder(orderId));
    return extractApiData(response);
  },
};

/**
 * Fetch shipping quotes for checkout (Shipmondo).
 * The server falls back to configured defaults (postal code / country) when
 * the receiver address has no postal code.
 */
export function useShippingQuotes(
  items: Array<{ weight?: number }>,
  receiver: ShipmondoQuoteRequest['receiver'],
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: shipmondoKeys.quotes({ items, receiver }),
    queryFn: () => shipmondoApi.getQuotes({ items, receiver }),
    enabled: options?.enabled ?? items.length > 0,
    staleTime: STALE_TIME.SHORT,
    retry: 0,
  });
}

/** Book a Shipmondo shipment for an order (seller/admin). */
export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shipmondoApi.createShipment,
    onSuccess: (data) => {
      queryClient.setQueryData(orderKeys.detail(data.order._id), data.order);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shipmondoKeys.all });
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Create Shipmondo shipment failed' });
    },
  });
}

/** Fetch the latest Shipmondo shipment info + labels for an order. */
export function useOrderShipment(orderId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: shipmondoKeys.orderShipment(orderId),
    queryFn: () => shipmondoApi.getOrderShipment(orderId),
    enabled: options?.enabled ?? !!orderId,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/** Push an order to Shipmondo as a sales order (seller/admin). */
export function useSyncSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shipmondoApi.syncSalesOrder,
    onSuccess: (data) => {
      queryClient.setQueryData(orderKeys.detail(data.order._id), data.order);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Sync Shipmondo sales order failed' });
    },
  });
}

export type { ShippingOption };
