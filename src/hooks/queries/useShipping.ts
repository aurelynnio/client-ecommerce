import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { extractApiData } from '@/api';
import { shippingKeys } from '@/lib/queryKeys';
import {
  CreateShippingTemplatePayload,
  ShippingTemplate,
  UpdateShippingTemplatePayload,
} from '@/types/shipping';
import { errorHandler } from '@/services/errorHandler';

const shippingApi = {
  getMyTemplates: async (): Promise<ShippingTemplate[]> => {
    const response = await instance.get('/shipping');
    return extractApiData(response);
  },

  createTemplate: async (data: CreateShippingTemplatePayload): Promise<ShippingTemplate> => {
    const response = await instance.post('/shipping', data);
    return extractApiData(response);
  },

  updateTemplate: async ({
    templateId,
    data,
  }: {
    templateId: string;
    data: UpdateShippingTemplatePayload;
  }): Promise<ShippingTemplate> => {
    const response = await instance.put(`/shipping/${templateId}`, data);
    return extractApiData(response);
  },

  deleteTemplate: async (templateId: string): Promise<void> => {
    await instance.delete(`/shipping/${templateId}`);
  },
};

export function useMyShippingTemplates() {
  return useQuery({
    queryKey: shippingKeys.templates(),
    queryFn: shippingApi.getMyTemplates,
  });
}

export function useCreateShippingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shippingApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.templates() });
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Create shipping template failed' });
    },
  });
}

export function useUpdateShippingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shippingApi.updateTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.templates() });
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Update shipping template failed' });
    },
  });
}

export function useDeleteShippingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shippingApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.templates() });
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Delete shipping template failed' });
    },
  });
}
