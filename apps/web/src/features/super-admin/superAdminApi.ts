import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store/store';

export const superAdminApi = createApi({
  reducerPath: 'superAdminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/super-admin',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Tenant', 'AuditLog', 'Stats', 'Analytics', 'Health'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/stats',
      providesTags: ['Stats'],
    }),
    getAnalytics: builder.query({
      query: () => '/analytics',
      providesTags: ['Analytics'],
    }),
    getSystemHealth: builder.query({
      query: () => '/system-health',
      providesTags: ['Health'],
    }),
    getTenants: builder.query({
      query: () => '/tenants',
      providesTags: ['Tenant'],
    }),
    getTenantById: builder.query({
      query: (id) => `/tenants/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tenant', id }],
    }),
    createTenant: builder.mutation({
      query: (data) => ({
        url: '/tenants',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tenant', 'Stats'],
    }),
    updateTenant: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/tenants/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Tenant', id }, 'Tenant'],
    }),
    deactivateTenant: builder.mutation({
      query: (id) => ({
        url: `/tenants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Tenant', id }, 'Tenant', 'Stats'],
    }),
    updateFeatureFlags: builder.mutation({
      query: ({ id, features }) => ({
        url: `/tenants/${id}/feature-flags`,
        method: 'POST',
        body: { features },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Tenant', id }],
    }),
    impersonateTenant: builder.mutation({
      query: (id) => ({
        url: `/impersonate/${id}`,
        method: 'POST',
      }),
    }),
    getAuditLogs: builder.query({
      query: ({ limit = 50, skip = 0 }) => `/audit-logs?limit=${limit}&skip=${skip}`,
      providesTags: ['AuditLog'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAnalyticsQuery,
  useGetSystemHealthQuery,
  useGetTenantsQuery,
  useGetTenantByIdQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeactivateTenantMutation,
  useUpdateFeatureFlagsMutation,
  useGetAuditLogsQuery,
  useImpersonateTenantMutation,
} = superAdminApi;
