import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { authSlice } from '@/features/auth/authSlice';
import { useQueryClient } from '@tanstack/react-query';
import {
  cartKeys,
  notificationKeys,
  orderKeys,
  shopKeys,
  userKeys,
  wishlistKeys,
} from '@/lib/queryKeys';
import instance from '@/api/api';
import { ENDPOINT_USER } from '@/constants/endpoint';

export const useAuthPersistence = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (initialized.current) return;
    initialized.current = true;

    const checkAuthStatus = async () => {
      try {
        // Attempt to fetch profile. If cookies are valid, this will succeed.
        const response = await instance.get(ENDPOINT_USER.PROFILE);
        const result = response?.data?.data;

        if (result) {
          dispatch(authSlice.actions.setIsAuthenticated(true));
          dispatch(authSlice.actions.setUserData(result));
          // Pre-populate React Query cache
          queryClient.setQueryData(userKeys.profile(), result);
        }
      } catch {
        // If 401/403 or network error, assume not authenticated via cookies
        dispatch(authSlice.actions.clearAuth());
        queryClient.removeQueries({ queryKey: userKeys.all });
        queryClient.removeQueries({ queryKey: cartKeys.all });
        queryClient.removeQueries({ queryKey: wishlistKeys.all });
        queryClient.removeQueries({ queryKey: notificationKeys.all });
        queryClient.removeQueries({ queryKey: orderKeys.all });
        queryClient.removeQueries({ queryKey: shopKeys.myShop() });
      }
    };

    checkAuthStatus();
  }, [dispatch, queryClient]);
};
