import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      const tenantSlug = state.auth.tenantSlug;
      if (tenantSlug) {
        headers.set('X-Tenant-Slug', tenantSlug);
      }
      return headers;
    },
  }),
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getExecutiveMetrics: builder.query<any, void>({
      query: () => '/analytics/executive',
      providesTags: ['Analytics'],
    }),
    getClinicalMetrics: builder.query<any, void>({
      query: () => '/analytics/clinical',
      providesTags: ['Analytics'],
    }),
    getOperationalMetrics: builder.query<any, void>({
      query: () => '/analytics/operational',
      providesTags: ['Analytics'],
    }),
    getFinancialMetrics: builder.query<any, void>({
      query: () => '/analytics/financial',
      providesTags: ['Analytics'],
    }),
    generateCustomReport: builder.mutation<any, any>({
      query: (data: any) => ({
        url: '/analytics/custom',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetExecutiveMetricsQuery,
  useGetClinicalMetricsQuery,
  useGetOperationalMetricsQuery,
  useGetFinancialMetricsQuery,
  useGenerateCustomReportMutation,
} = analyticsApi;
