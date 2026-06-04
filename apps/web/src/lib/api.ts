import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';

// ─── Environment ─────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// ─── Instance ─────────────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For cookies if needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Get token from Redux store
    const state = store.getState();
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Multi-tenant support (X-Tenant-Slug header)
    // In production, this might be handled by subdomains (e.g. hospital.medicalink.app)
    // In development or single-domain setup, we pass the slug explicitly
    const tenantSlug = state.auth.tenantSlug;
    if (tenantSlug && config.headers) {
      config.headers['X-Tenant-Slug'] = tenantSlug;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // If the API returns a standard success wrapper, we can unpack it here
    // return response.data.data ? response.data.data : response;
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear user credentials and trigger logout action when unauthorized
      store.dispatch(logout());
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Pass the standard error format back to the caller
    const apiError = error.response?.data || { message: 'An unexpected error occurred' };
    return Promise.reject(apiError);
  }
);
