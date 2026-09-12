/**
 * Shipmondo integration types (mirror the normalized server payloads).
 */

/** A shipping quote option returned by POST /api/shipmondo/quotes */
export interface ShipmondoQuote {
  productCode: string;
  productName: string;
  carrierCode: string | null;
  carrierName: string | null;
  price: number | null;
  currency: string | null;
  servicePointRequired: boolean;
  deliveryDays: number | null;
  description: string;
}

/** Service point selected at checkout / for a shipment */
export interface ShipmondoServicePoint {
  id: string;
  name?: string;
  address1?: string;
  postalCode?: string;
  postal_code?: string;
  city?: string;
  countryCode?: string;
  country_code?: string;
}

/** Payload for a quote request */
export interface ShipmondoQuoteRequest {
  items: Array<{ weight?: number }>;
  receiver?: {
    postalCode?: string;
    postal_code?: string;
    countryCode?: string;
    country_code?: string;
    city?: string;
  };
  senderCountryCode?: string;
}

/** Per-shop shipping selection sent with order creation */
export interface ShippingOption {
  shopId: string;
  fee: number;
  carrierCode?: string;
  productCode?: string;
  servicePoint?: ShipmondoServicePoint;
}

/** Normalized shipment info (GET /api/shipmondo/orders/:id/shipment) */
export interface ShipmondoShipment {
  shipmentId: string | null;
  carrierCode: string | null;
  carrierName: string | null;
  trackingNumbers: string[];
  price: number | null;
  currency: string | null;
  status: string | null;
}

export interface ShipmondoShipmentInfo {
  shipment: ShipmondoShipment | null;
  labelUrls: string[];
  error?: string | null;
}
