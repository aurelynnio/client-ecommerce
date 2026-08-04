import instance from '@/api/api';
import { ENDPOINT_SHIPPING } from '@/constants/endpoint';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { CreateShippingTemplatePayload, UpdateShippingTemplatePayload } from '@/types/shipping';
import { extractApiData, extractApiError } from '@/api';

// Get seller's shipping templates
export const getMyShippingTemplates = createAsyncThunk(
  'shipping/getMyTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get(ENDPOINT_SHIPPING.ROOT);
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

// Create shipping template
export const createShippingTemplate = createAsyncThunk(
  'shipping/create',
  async (data: CreateShippingTemplatePayload, { rejectWithValue }) => {
    try {
      const response = await instance.post(ENDPOINT_SHIPPING.ROOT, data);
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

// Update shipping template
export const updateShippingTemplate = createAsyncThunk(
  'shipping/update',
  async (
    { templateId, data }: { templateId: string; data: UpdateShippingTemplatePayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await instance.put(ENDPOINT_SHIPPING.byTemplateId(templateId), data);
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

// Delete shipping template
export const deleteShippingTemplate = createAsyncThunk(
  'shipping/delete',
  async (templateId: string, { rejectWithValue }) => {
    try {
      await instance.delete(ENDPOINT_SHIPPING.byTemplateId(templateId));
      return templateId;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);
