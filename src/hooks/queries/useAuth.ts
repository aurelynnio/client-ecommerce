import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { extractApiData } from '@/api';
import {
  AuthLogin,
  AuthRegister,
  LoginResult,
  PasswordReset,
  TwoFactorLoginChallenge,
  User,
} from '@/types/auth';
import { useAppDispatch } from '@/hooks/hooks';
import { authSlice } from '@/features/auth/authSlice';
import {
  cartKeys,
  notificationKeys,
  orderKeys,
  shopKeys,
  userKeys,
  wishlistKeys,
} from '@/lib/queryKeys';

interface VerifyCodePayload {
  email: string;
  code: string;
}

interface RefreshTokenResponse {
  permissions?: string[];
}

interface VerifyLoginTwoFactorPayload {
  challengeToken: string;
  code: string;
}

const authApi = {
  login: async (credentials: AuthLogin): Promise<LoginResult> => {
    const response = await instance.post('/auth/login', credentials, {
      withCredentials: true,
    });
    return extractApiData(response);
  },

  register: async (credentials: AuthRegister): Promise<unknown> => {
    const payload = {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
    };
    const response = await instance.post('/auth/register', payload, {
      withCredentials: true,
    });
    return extractApiData(response);
  },

  sendVerificationCode: async (payload: { email: string }): Promise<unknown> => {
    const response = await instance.post('/auth/send-verification-code', payload, {
      withCredentials: true,
    });
    return extractApiData(response);
  },

  verifyCode: async (payload: VerifyCodePayload): Promise<User> => {
    const response = await instance.post('/auth/verify-code', payload);
    return extractApiData(response);
  },

  forgotPassword: async (email: string): Promise<unknown> => {
    const response = await instance.post('/auth/forgot-password', { email });
    return extractApiData(response);
  },

  resetPassword: async (payload: PasswordReset): Promise<unknown> => {
    const response = await instance.post('/auth/reset-password', payload);
    return extractApiData(response);
  },

  logout: async (): Promise<void> => {
    await instance.post('/auth/logout');
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await instance.post('/auth/refresh-token');
    return extractApiData(response);
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await instance.get('/users/profile');
    return extractApiData(response);
  },

  verifyLoginTwoFactor: async (payload: VerifyLoginTwoFactorPayload): Promise<User> => {
    const response = await instance.post('/auth/2fa/verify-login', payload, {
      withCredentials: true,
    });
    return extractApiData(response);
  },

  resendLoginTwoFactorCode: async (
    payload: Pick<VerifyLoginTwoFactorPayload, 'challengeToken'>,
  ): Promise<{ email: string; expiresIn: string }> => {
    const response = await instance.post('/auth/2fa/resend-login-code', payload, {
      withCredentials: true,
    });
    return extractApiData(response);
  },
};

function setAuthenticatedUser(dispatch: ReturnType<typeof useAppDispatch>, user: User) {
  dispatch(authSlice.actions.setIsAuthenticated(true));
  dispatch(authSlice.actions.setUserData(user));
}

function clearUserSession(dispatch: ReturnType<typeof useAppDispatch>) {
  dispatch(authSlice.actions.clearAuth());
}

function isTwoFactorChallenge(result: LoginResult): result is TwoFactorLoginChallenge {
  return 'requiresTwoFactor' in result && result.requiresTwoFactor === true;
}

export function useLogin() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (result) => {
      if (isTwoFactorChallenge(result)) {
        return;
      }

      setAuthenticatedUser(dispatch, result);
      queryClient.setQueryData(userKeys.profile(), result);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useSendVerificationCode() {
  return useMutation({
    mutationFn: authApi.sendVerificationCode,
  });
}

export function useVerifyCode() {
  return useMutation({
    mutationFn: authApi.verifyCode,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearUserSession(dispatch);
      queryClient.removeQueries({ queryKey: userKeys.all });
      queryClient.removeQueries({ queryKey: cartKeys.all });
      queryClient.removeQueries({ queryKey: wishlistKeys.all });
      queryClient.removeQueries({ queryKey: notificationKeys.all });
      queryClient.removeQueries({ queryKey: orderKeys.all });
      queryClient.removeQueries({ queryKey: shopKeys.myShop() });
    },
  });
}

export function useRefreshAuthSession() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<User> => {
      await authApi.refreshToken();
      return authApi.getCurrentUser();
    },
    onSuccess: (user) => {
      setAuthenticatedUser(dispatch, user);
      queryClient.setQueryData(userKeys.profile(), user);
    },
  });
}

export function useVerifyLoginTwoFactor() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.verifyLoginTwoFactor,
    onSuccess: (user) => {
      setAuthenticatedUser(dispatch, user);
      queryClient.setQueryData(userKeys.profile(), user);
    },
  });
}

export function useResendLoginTwoFactorCode() {
  return useMutation({
    mutationFn: authApi.resendLoginTwoFactorCode,
  });
}
