import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { IBill, IInsuranceClaim, IInsurancePanel, IServiceCharge, ApiResponse } from '@medicalink/shared';
import type { RootState } from '../../../store/store';

const getAuthToken = (state: RootState) => state.auth.token;

export const billingApi = createApi({
  reducerPath: 'billingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/billing',
    prepareHeaders: (headers, { getState }) => {
      const token = getAuthToken(getState() as RootState);
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Bill', 'InsuranceClaim', 'InsurancePanel', 'ServiceCharge', 'BillingDashboard'],
  endpoints: (builder) => ({
    // --- Core Billing ---
    listBills: builder.query<ApiResponse<IBill[]>, { status?: string; patientId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/bills',
        params,
      }),
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Bill' as const, id: _id })),
              { type: 'Bill', id: 'LIST' },
            ]
          : [{ type: 'Bill', id: 'LIST' }],
    }),
    
    getBillDetail: builder.query<ApiResponse<IBill>, string>({
      query: (id) => `/bills/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Bill', id }],
    }),

    getPendingCharges: builder.query<ApiResponse<any[]>, { patientId: string; consultationId?: string }>({
      query: (params) => ({
        url: '/bills/pending-charges',
        params,
      }),
    }),

    createBill: builder.mutation<ApiResponse<IBill>, Partial<IBill>>({
      query: (body) => ({
        url: '/bills',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Bill', id: 'LIST' }, 'BillingDashboard'],
    }),

    updateBill: builder.mutation<ApiResponse<IBill>, { id: string; data: Partial<IBill> }>({
      query: ({ id, data }) => ({
        url: `/bills/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Bill', id }, { type: 'Bill', id: 'LIST' }],
    }),

    finalizeBill: builder.mutation<ApiResponse<IBill>, string>({
      query: (id) => ({
        url: `/bills/${id}/finalize`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Bill', id }, { type: 'Bill', id: 'LIST' }, 'BillingDashboard'],
    }),

    recordPayment: builder.mutation<ApiResponse<IBill>, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/bills/${id}/payment`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Bill', id }, { type: 'Bill', id: 'LIST' }, 'BillingDashboard'],
    }),

    voidBill: builder.mutation<ApiResponse<IBill>, { id: string; voidReason: string }>({
      query: ({ id, voidReason }) => ({
        url: `/bills/${id}/void`,
        method: 'POST',
        body: { voidReason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Bill', id }, { type: 'Bill', id: 'LIST' }, 'BillingDashboard'],
    }),

    issueCreditNote: builder.mutation<ApiResponse<any>, { id: string; amount: number; reason: string }>({
      query: ({ id, ...body }) => ({
        url: `/bills/${id}/credit-note`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Bill', id }, { type: 'Bill', id: 'LIST' }, 'BillingDashboard'],
    }),

    // --- Insurance ---
    listInsuranceClaims: builder.query<ApiResponse<any[]>, { status?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/insurance-claims',
        params,
      }),
      providesTags: [{ type: 'InsuranceClaim', id: 'LIST' }],
    }),

    submitClaim: builder.mutation<ApiResponse<IInsuranceClaim>, { id: string; claimNumber?: string; claimedAmount?: number }>({
      query: ({ id, ...body }) => ({
        url: `/insurance-claims/${id}/submit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'InsuranceClaim', id: 'LIST' }, { type: 'Bill', id: 'LIST' }, 'BillingDashboard'],
    }),

    updateClaimStatus: builder.mutation<ApiResponse<IInsuranceClaim>, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/insurance-claims/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'InsuranceClaim', id: 'LIST' }, { type: 'Bill', id: 'LIST' }, 'BillingDashboard'],
    }),

    listInsurancePanels: builder.query<ApiResponse<IInsurancePanel[]>, void>({
      query: () => '/panels',
      providesTags: [{ type: 'InsurancePanel', id: 'LIST' }],
    }),

    createInsurancePanel: builder.mutation<ApiResponse<IInsurancePanel>, Partial<IInsurancePanel>>({
      query: (body) => ({
        url: '/panels',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'InsurancePanel', id: 'LIST' }],
    }),

    // --- Reports ---
    getDailyCollection: builder.query<ApiResponse<any>, { date?: string }>({
      query: (params) => ({
        url: '/reports/daily-collection',
        params,
      }),
      providesTags: ['BillingDashboard'],
    }),

    getRevenueAnalytics: builder.query<ApiResponse<any>, void>({
      query: () => '/reports/revenue',
      providesTags: ['BillingDashboard'],
    }),

    getOutstandingReport: builder.query<ApiResponse<any[]>, void>({
      query: () => '/reports/outstanding',
      providesTags: ['BillingDashboard'],
    }),

    getInsuranceReport: builder.query<ApiResponse<any>, void>({
      query: () => '/reports/insurance',
      providesTags: ['BillingDashboard'],
    }),

    // --- Service Charges ---
    listServiceCharges: builder.query<ApiResponse<IServiceCharge[]>, { category?: string; search?: string }>({
      query: (params) => ({
        url: '/services',
        params,
      }),
      providesTags: [{ type: 'ServiceCharge', id: 'LIST' }],
    }),

    createServiceCharge: builder.mutation<ApiResponse<IServiceCharge>, Partial<IServiceCharge>>({
      query: (body) => ({
        url: '/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ServiceCharge', id: 'LIST' }],
    }),
  }),
});

export const {
  useListBillsQuery,
  useGetBillDetailQuery,
  useGetPendingChargesQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useFinalizeBillMutation,
  useRecordPaymentMutation,
  useVoidBillMutation,
  useIssueCreditNoteMutation,
  
  useListInsuranceClaimsQuery,
  useSubmitClaimMutation,
  useUpdateClaimStatusMutation,
  useListInsurancePanelsQuery,
  useCreateInsurancePanelMutation,
  
  useGetDailyCollectionQuery,
  useGetRevenueAnalyticsQuery,
  useGetOutstandingReportQuery,
  useGetInsuranceReportQuery,
  
  useListServiceChargesQuery,
  useCreateServiceChargeMutation,
} = billingApi;
