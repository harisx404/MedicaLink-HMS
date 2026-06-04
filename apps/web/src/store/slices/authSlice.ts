import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  requires2FA: boolean;
  tempUserId: string | null;
  isLoading: boolean;
  error: string | null;
}

// We only retrieve tenantSlug from localStorage to remember the tenant login portal
const getInitialState = (): AuthState => {
  try {
    const tenantSlug = localStorage.getItem('tenantSlug');
    if (tenantSlug) {
      return {
        user: null,
        token: null,
        tenantSlug,
        isAuthenticated: false,
        requires2FA: false,
        tempUserId: null,
        isLoading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error('Failed to parse tenant state from localStorage', error);
  }

  return {
    user: null,
    token: null,
    tenantSlug: null,
    isAuthenticated: false,
    requires2FA: false,
    tempUserId: null,
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; tenantSlug?: string }>
    ) => {
      const { user, token, tenantSlug } = action.payload;
      state.user = user;
      state.token = token;
      state.tenantSlug = tenantSlug || state.tenantSlug;
      state.isAuthenticated = true;
      state.requires2FA = false;
      state.tempUserId = null;
      state.error = null;

      // Persist tenantSlug to localStorage
      if (state.tenantSlug) {
        localStorage.setItem('tenantSlug', state.tenantSlug);
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setTenant: (state, action: PayloadAction<string>) => {
      state.tenantSlug = action.payload;
      localStorage.setItem('tenantSlug', action.payload);
    },
    setRequires2FA: (state, action: PayloadAction<{ tempUserId: string }>) => {
      state.requires2FA = true;
      state.tempUserId = action.payload.tempUserId;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.requires2FA = false;
      state.tempUserId = null;
      state.error = null;
      // Do not clear tenantSlug so user can login back to the same hospital
    },
  },
});

export const {
  setLoading,
  setError,
  setCredentials,
  setToken,
  setTenant,
  setRequires2FA,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
