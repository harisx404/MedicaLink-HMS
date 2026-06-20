import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { ApiResponse, ITestCatalog, ILabOrder, ILabResult } from '@medicalink/shared';

export const labApi = createApi({
  reducerPath: 'labApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/lab',
    prepareHeaders: (headers, { getState }) => {
      const { token, tenantSlug } = (getState() as RootState).auth;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      if (tenantSlug) {
        headers.set('x-tenant-slug', tenantSlug);
      }
      return headers;
    },
  }),
  tagTypes: ['TestCatalog', 'LabOrder', 'LabResult', 'LabDashboard'],
  endpoints: (builder) => ({
    // Test Catalog
    listTestCatalog: builder.query<ApiResponse<ITestCatalog[]>, { search?: string; category?: string; activeOnly?: boolean } | void>({
      query: (params) => ({
        url: '/tests',
        params: params || undefined,
      }),
      providesTags: ['TestCatalog'],
    }),
    createTest: builder.mutation<ApiResponse<ITestCatalog>, Partial<ITestCatalog>>({
      query: (body) => ({
        url: '/tests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TestCatalog'],
    }),
    updateTest: builder.mutation<ApiResponse<ITestCatalog>, { id: string; data: Partial<ITestCatalog> }>({
      query: ({ id, data }) => ({
        url: `/tests/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['TestCatalog'],
    }),
    
    // Lab Orders
    listLabOrders: builder.query<ApiResponse<ILabOrder[]>, { status?: string; patientId?: string; startDate?: string; endDate?: string } | void>({
      query: (params) => ({
        url: '/orders',
        params: params || undefined,
      }),
      providesTags: ['LabOrder', 'LabDashboard'],
    }),
    createLabOrder: builder.mutation<ApiResponse<ILabOrder>, Partial<ILabOrder>>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LabOrder', 'LabDashboard'],
    }),
    getOrderDetails: builder.query<ApiResponse<{ order: ILabOrder; results: ILabResult[] }>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'LabOrder', id }, { type: 'LabResult', id }],
    }),
    getLabDashboardStats: builder.query<ApiResponse<any>, void>({
      query: () => '/dashboard/stats',
      providesTags: ['LabDashboard'],
    }),
    getLabWorkloadReport: builder.query<ApiResponse<any[]>, void>({
      query: () => '/reports/workload',
      providesTags: ['LabDashboard'],
    }),
    
    // Workflows
    collectSample: builder.mutation<ApiResponse<ILabOrder>, { id: string; sampleBarcode: string }>({
      query: ({ id, sampleBarcode }) => ({
        url: `/orders/${id}/collect-sample`,
        method: 'POST',
        body: { sampleBarcode },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'LabOrder', id },
        'LabOrder',
        'LabDashboard'
      ],
    }),
    enterResult: builder.mutation<ApiResponse<ILabResult>, { resultId: string; data: any }>({
      query: ({ resultId, data }) => ({
        url: `/results/${resultId}/enter`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LabResult', 'LabOrder', 'LabDashboard'],
    }),
    verifyOrderResults: builder.mutation<ApiResponse<ILabOrder>, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/verify`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'LabOrder', id },
        { type: 'LabResult', id },
        'LabOrder',
        'LabDashboard'
      ],
    }),
    generateReportPdf: builder.mutation<ApiResponse<any>, string>({
      query: (id) => ({
        url: `/results/${id}/report`,
        method: 'POST',
      }),
      invalidatesTags: ['LabResult', 'LabOrder', 'LabDashboard'],
    }),
  }),
});

export const {
  useListTestCatalogQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useListLabOrdersQuery,
  useCreateLabOrderMutation,
  useGetOrderDetailsQuery,
  useGetLabDashboardStatsQuery,
  useGetLabWorkloadReportQuery,
  useCollectSampleMutation,
  useEnterResultMutation,
  useVerifyOrderResultsMutation,
  useGenerateReportPdfMutation
} = labApi;
