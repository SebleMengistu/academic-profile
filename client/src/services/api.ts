/// <reference types="vite/client" />

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

// Response interceptor — handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push(() => resolve(api(original)));
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        onRefreshed('');
        return api(original);
      } catch {
        // Refresh failed — redirect to login
        refreshQueue = [];
        window.location.href = '/admin/login';
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'An error occurred';

    // Don't toast auth errors on login page
    if (
      error.response?.status !== 401 &&
      !original.url?.includes('/auth/login')
    ) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
