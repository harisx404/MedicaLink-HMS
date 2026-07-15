import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { SharedConsent, ApiResponse } from '@medicalink/shared';

const getBaseUrl = () => {
  const env = import.meta.env;
  return env.VITE_API_URL || 'http://localhost:5000/api/v1';
};

export const consentsApi = createApi({
  reducerPath: 'consentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/consents`,
    prepareHeaders: (headers, { getState }: any) => {
      const token = getState().auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Consents'],
  endpoints: (builder) => ({
    getConsents: builder.query<SharedConsent[], { patientId?: string } | void>({
      query: (params) => ({ url: '', params: params || {} }),
      providesTags: ['Consents'],
      transformResponse: (response: ApiResponse<SharedConsent[]>) => response.data || [],
    }),
    createConsent: builder.mutation<SharedConsent, Partial<SharedConsent>>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Consents'],
      transformResponse: (response: ApiResponse<SharedConsent>) => response.data as SharedConsent,
    }),
    signConsent: builder.mutation<SharedConsent, { id: string, signatureData: string, signedBy: string }>({
      query: ({ id, ...body }) => ({
        url: `/${id}/sign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Consents'],
      transformResponse: (response: ApiResponse<SharedConsent>) => response.data as SharedConsent,
    }),
  }),
});

export const { useGetConsentsQuery, useCreateConsentMutation, useSignConsentMutation } = consentsApi;
