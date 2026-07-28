import { createSlice } from '@reduxjs/toolkit';
import { ShippingState } from '@/types/shipping';
import {
  getMyShippingTemplates,
  createShippingTemplate,
  updateShippingTemplate,
  deleteShippingTemplate,
} from './shippingAction';

const initialState: ShippingState = {
  templates: [],
  currentTemplate: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

export const shippingSlice = createSlice({
  name: 'shipping',
  initialState,
  reducers: {
    clearShippingError: (state) => {
      state.error = null;
    },
    setCurrentTemplate: (state, action) => {
      state.currentTemplate = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get My Shipping Templates
    builder
      .addCase(getMyShippingTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyShippingTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload;
        state.error = null;
      })
      .addCase(getMyShippingTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as { message: string })?.message || 'Lỗi khi lấy shipping templates';
      });

    // Create Shipping Template
    builder
      .addCase(createShippingTemplate.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createShippingTemplate.fulfilled, (state, action) => {
        state.isCreating = false;
        state.templates.push(action.payload);
        state.error = null;
      })
      .addCase(createShippingTemplate.rejected, (state, action) => {
        state.isCreating = false;
        state.error = (action.payload as { message: string })?.message || 'Tạo template thất bại';
      });

    // Update Shipping Template
    builder
      .addCase(updateShippingTemplate.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateShippingTemplate.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.templates.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateShippingTemplate.rejected, (state, action) => {
        state.isUpdating = false;
        state.error =
          (action.payload as { message: string })?.message || 'Cập nhật template thất bại';
      });

    // Delete Shipping Template
    builder
      .addCase(deleteShippingTemplate.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteShippingTemplate.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.templates = state.templates.filter((t) => t._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteShippingTemplate.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = (action.payload as { message: string })?.message || 'Xóa template thất bại';
      });
  },
});

export const { clearShippingError, setCurrentTemplate } = shippingSlice.actions;
export default shippingSlice.reducer;
