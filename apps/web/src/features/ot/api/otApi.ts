import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { ApiResponse, IOTCase, IOperationTheater } from '@medicalink/shared';

export const otApi = createApi({
  reducerPath: 'otApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/ot',
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
  tagTypes: ['OTCase', 'OperationTheater'],
  endpoints: (builder) => ({
    getTheaters: builder.query<ApiResponse<IOperationTheater[]>, void>({
      query: () => '/theaters',
      providesTags: ['OperationTheater'],
    }),
    createTheater: builder.mutation<ApiResponse<IOperationTheater>, Partial<IOperationTheater>>({
      query: (body) => ({
        url: '/theaters',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OperationTheater'],
    }),
    getCases: builder.query<ApiResponse<IOTCase[]>, { date?: string }>({
      query: (params) => ({
        url: '/cases',
        params,
      }),
      providesTags: ['OTCase'],
    }),
    getCaseById: builder.query<ApiResponse<IOTCase>, string>({
      query: (id) => `/cases/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'OTCase', id }],
    }),
    scheduleCase: builder.mutation<ApiResponse<IOTCase>, Partial<IOTCase>>({
      query: (body) => ({
        url: '/cases',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OTCase'],
    }),
    updateCaseStatus: builder.mutation<ApiResponse<IOTCase>, { id: string, status: string }>({
      query: ({ id, status }) => ({
        url: `/cases/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'OTCase', id }, 'OTCase'],
    }),
    updateCaseSection: builder.mutation<ApiResponse<IOTCase>, { id: string, section: string, data: any }>({
      query: ({ id, section, data }) => ({
        url: `/cases/${id}/section`,
        method: 'PUT',
        body: { section, data },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'OTCase', id }, 'OTCase'],
    }),
  }),
});

export const {
  useGetTheatersQuery,
  useCreateTheaterMutation,
  useGetCasesQuery,
  useGetCaseByIdQuery,
  useScheduleCaseMutation,
  useUpdateCaseStatusMutation,
  useUpdateCaseSectionMutation
} = otApi;
