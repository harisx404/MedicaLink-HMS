import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { SharedCompliance, ApiResponse } from '@medicalink/shared';

const getBaseUrl = () => {
  const env = import.meta.env;
  return env.VITE_API_URL || 'http://localhost:5000/api/v1';
};

export const complianceApi = createApi({
  reducerPath: 'complianceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/compliance`,
    prepareHeaders: (headers, { getState }: any) => {
      const token = getState().auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Compliance'],
  endpoints: (builder) => ({
    getRequirements: builder.query<SharedCompliance[], { framework?: string } | void>({
      query: (params) => ({ url: '', params: params || {} }),
      providesTags: ['Compliance'],
      transformResponse: (response: ApiResponse<SharedCompliance[]>) => response.data || [],
    }),
    updateStatus: builder.mutation<SharedCompliance, { id: string, status: string, notes: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Compliance'],
      transformResponse: (response: ApiResponse<SharedCompliance>) => response.data as SharedCompliance,
    }),
  }),
});

export const { useGetRequirementsQuery, useUpdateStatusMutation } = complianceApi;
