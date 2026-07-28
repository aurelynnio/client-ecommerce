import instance from '@/api/api';
import { AuthLogin, AuthRegister } from '@/types/auth';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { extractApiData, extractApiError } from '@/api';

export const login = createAsyncThunk(
  'auth/login',
  async (Credentials: AuthLogin, { rejectWithValue }) => {
    try {
      const response = await instance.post('/auth/login', Credentials, {
        withCredentials: true,
      });
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (Credentials: AuthRegister, { rejectWithValue }) => {
    try {
      const response = await instance.post('/auth/register', Credentials, {
        withCredentials: true,
      });
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

export const sendCode = createAsyncThunk(
  'auth/verifyEmail',
  async (data: { email: string }, { rejectWithValue }) => {
    try {
      const response = await instance.post('/auth/send-verification-code', data, {
        withCredentials: true,
      });
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

export const verifyCode = createAsyncThunk(
  'auth/verify-email',
  async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await instance.post('/auth/verify-code', {
        email,
        code,
      });
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const response = await instance.post('/auth/logout');
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

export const forgotPassword = createAsyncThunk(
  'auth/forgot-password',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await instance.post('/auth/forgot-password', { email });
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    { email, code, newPassword }: { email: string; code: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await instance.post('/auth/reset-password', {
        email,
        code,
        newPassword,
      });
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);
