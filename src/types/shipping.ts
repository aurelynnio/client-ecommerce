// Shipping rule type
export type ShippingRuleType = 'fixed' | 'weight_based' | 'quantity_based';

// Shipping rule interface
export interface ShippingRule {
  _id?: string;
  name: string;
  type: ShippingRuleType;
  baseFee: number;
  stepUnit?: number;
  stepFee?: number;
}

// Shipping template interface
export interface ShippingTemplate {
  _id: string;
  shop: string;
  name: string;
  isDefault: boolean;
  rules: ShippingRule[];
  createdAt: string;
  updatedAt: string;
}

// Create shipping template payload
export interface CreateShippingTemplatePayload {
  name: string;
  rules: Omit<ShippingRule, '_id'>[];
  isDefault?: boolean;
}

// Update shipping template payload
export interface UpdateShippingTemplatePayload {
  name?: string;
  rules?: Omit<ShippingRule, '_id'>[];
  isDefault?: boolean;
}

// Shipping state for Redux
export interface ShippingState {
  templates: ShippingTemplate[];
  currentTemplate: ShippingTemplate | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}
