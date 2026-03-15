import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authSlice } from "@/features/auth/authSlice";
import type { Store } from "@reduxjs/toolkit";

// Type for the Redux store
type AppStore = Store;

// Type for queued promise handlers
interface QueuedPromise {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let store: AppStore | null = null;

export const injectStore = (_store: AppStore) => {
  store = _store;
};

// Create a queue to hold failed requests while refreshing token
let isRefreshing = false;
let failedQueue: QueuedPromise[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : "http://localhost:5000/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Client-side cookie based auth - no need to inject header manually
    // The browser automatically caches certificates and sends cookies with withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token expiration
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and it's not a retry and not the refresh token call itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      if (isRefreshing) {
        // If already refreshing, add request to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token via cookie
        await instance.post("/auth/refresh-token");

        // If successful, the server has set a new access token cookie
        // We just need to retry the original request

        // Sync with Redux if store is injected (optional, mostly for IsAuthenticated state)
        if (store) {
          // We might not have the new token text to put in store because it is HttpOnly
          // But we can ensure state knows we are authenticated
          store.dispatch(authSlice.actions.setIsAuthenticated(true));
        }

        processQueue(null);
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // If refresh fails, clear everything
        if (typeof window !== "undefined") {
          // Send event to let app know to redirect to login
          window.dispatchEvent(new Event("auth-logout"));
        }

        if (store) {
          store.dispatch(authSlice.actions.clearAuth());
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
