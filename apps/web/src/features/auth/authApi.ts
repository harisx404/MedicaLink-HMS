import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store/store';
import { env } from '../../config/env';

// Base API for auth that uses basic fetchBaseQuery.
// We avoid using the custom axios api instance here because RTK Query
// works best with its own fetchBaseQuery wrapper, and for auth routes,
// we mostly don't need the complex interceptors except for refresh,
// which we handle separately or natively.
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${env.VITE_API_URL}/auth`,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    verify2FA: builder.mutation({
      query: (data) => ({
        url: '/verify-2fa',
        method: 'POST',
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: '/verify-email',
        method: 'POST',
        body: { token },
      }),
    }),
    setup2FA: builder.mutation({
      query: () => ({
        url: '/setup-2fa',
        method: 'POST',
      }),
    }),
    enable2FA: builder.mutation({
      query: (data) => ({
        url: '/enable-2fa',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
    refresh: builder.mutation({
      query: () => ({
        url: '/refresh',
        method: 'POST',
      }),
    }),
    getMe: builder.query({
      query: () => '/me',
    }),
  }),
});

export const {
  useLoginMutation,
  useVerify2FAMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useSetup2FAMutation,
  useEnable2FAMutation,
  useLogoutMutation,
  useRefreshMutation,
  useLazyGetMeQuery,
} = authApi;
