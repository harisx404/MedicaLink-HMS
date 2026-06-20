import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'NURSE' | 'HOSPITAL_ADMIN' | 'SUPER_ADMIN';
  firstName: string;
  lastName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  tenantSlug: string | null;
  isLoading: boolean;
  setAccessToken: (token: string) => void;
  setTenantSlug: (slug: string) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  tenantSlug: null,
  isLoading: true,

  setAccessToken: (token) => set({ accessToken: token }),

  setTenantSlug: async (slug) => {
    await SecureStore.setItemAsync('tenantSlug', slug);
    set({ tenantSlug: slug });
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', credentials);
      const { accessToken, refreshToken, user } = response.data.data;

      if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
      }

      set({ user, accessToken, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors — we clear local state regardless
    } finally {
      await SecureStore.deleteItemAsync('refreshToken');
      // Intentionally keep tenantSlug so it's remembered for the next login
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const tenantSlug = await SecureStore.getItemAsync('tenantSlug');
      if (tenantSlug) {
        set({ tenantSlug });
      }

      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        const response = await api.post('/auth/refresh', { refreshToken });
        const { accessToken } = response.data.data;
        set({ accessToken });

        const userResponse = await api.get('/auth/me');
        set({ user: userResponse.data.data.user });
      }
    } catch {
      await SecureStore.deleteItemAsync('refreshToken');
    } finally {
      set({ isLoading: false });
    }
  },
}));
