import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { ApiResponse, IDonor, IBloodUnit, IBloodRequest } from '@medicalink/shared';

export const bloodBankApi = createApi({
  reducerPath: 'bloodBankApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/bloodbank',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      const tenantId = ((getState() as RootState).auth as any).tenantId;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      if (tenantId) {
        headers.set('x-tenant-slug', tenantId);
      }
      return headers;
    },
  }),
  tagTypes: ['Donor', 'BloodUnit', 'BloodRequest'],
  endpoints: (builder) => ({
    // DONORS
    getDonors: builder.query<ApiResponse<IDonor[]>, void>({
      query: () => '/donors',
      providesTags: ['Donor'],
    }),
    registerDonor: builder.mutation<ApiResponse<IDonor>, Partial<IDonor>>({
      query: (body) => ({
        url: '/donors',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Donor'],
    }),

    // INVENTORY
    getInventory: builder.query<ApiResponse<IBloodUnit[]>, void>({
      query: () => '/inventory',
      providesTags: ['BloodUnit'],
    }),
    getInventoryStats: builder.query<ApiResponse<any[]>, void>({
      query: () => '/inventory/stats',
      providesTags: ['BloodUnit'],
    }),
    addBloodUnit: builder.mutation<ApiResponse<IBloodUnit>, Partial<IBloodUnit>>({
      query: (body) => ({
        url: '/inventory',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BloodUnit', 'Donor'],
    }),
    updateTestResults: builder.mutation<ApiResponse<IBloodUnit>, { id: string, tests: any }>({
      query: ({ id, tests }) => ({
        url: `/inventory/${id}/tests`,
        method: 'PUT',
        body: { tests },
      }),
      invalidatesTags: ['BloodUnit'],
    }),

    // REQUESTS
    getBloodRequests: builder.query<ApiResponse<IBloodRequest[]>, void>({
      query: () => '/requests',
      providesTags: ['BloodRequest'],
    }),
    createBloodRequest: builder.mutation<ApiResponse<IBloodRequest>, Partial<IBloodRequest>>({
      query: (body) => ({
        url: '/requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BloodRequest'],
    }),
    crossMatchUnit: builder.mutation<ApiResponse<any>, { requestId: string, unitId: string }>({
      query: (body) => ({
        url: '/requests/crossmatch',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BloodUnit', 'BloodRequest'],
    }),
    issueUnit: builder.mutation<ApiResponse<any>, { requestId: string, unitId: string }>({
      query: (body) => ({
        url: '/requests/issue',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BloodUnit', 'BloodRequest'],
    }),
  }),
});

export const {
  useGetDonorsQuery,
  useRegisterDonorMutation,
  useGetInventoryQuery,
  useGetInventoryStatsQuery,
  useAddBloodUnitMutation,
  useUpdateTestResultsMutation,
  useGetBloodRequestsQuery,
  useCreateBloodRequestMutation,
  useCrossMatchUnitMutation,
  useIssueUnitMutation
} = bloodBankApi;
