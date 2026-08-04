/**
 * Settings React Query Hooks (Admin)
 * Hooks for managing system settings
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { ENDPOINT_SETTINGS } from '@/constants/endpoint';
import { extractApiData } from '@/api';
import { errorHandler } from '@/lib/error-handler';
import { STALE_TIME } from '@/constants/cache';
import { settingsKeys } from '@/lib/queryKeys';
import { Settings, UpdateSettingsPayload } from '@/types/settings';

const settingsApi = {
  getSettings: async (): Promise<Settings> => {
    const response = await instance.get(ENDPOINT_SETTINGS.ROOT);
    return extractApiData(response);
  },

  updateSettings: async (data: UpdateSettingsPayload): Promise<Settings> => {
    const response = await instance.put(ENDPOINT_SETTINGS.ROOT, data);
    return extractApiData(response);
  },
};

/**
 * Fetch current settings
 */
export function useSettings(options?: { enabled?: boolean }) {
  return useQuery<Settings, Error, Settings, ReturnType<typeof settingsKeys.current>>({
    queryKey: settingsKeys.current(),
    queryFn: settingsApi.getSettings,
    enabled: options?.enabled,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * Update settings (partial update)
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.current(), data);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Update settings failed' });
    },
  });
}
