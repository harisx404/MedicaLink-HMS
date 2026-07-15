import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { SharedDocument, ApiResponse } from '@medicalink/shared';

const getBaseUrl = () => {
  const env = import.meta.env;
  return env.VITE_API_URL || 'http://localhost:5000/api/v1';
};

export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/documents`,
    prepareHeaders: (headers, { getState }: any) => {
      const token = getState().auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Documents'],
  endpoints: (builder) => ({
    getDocuments: builder.query<SharedDocument[], { category?: string; patientId?: string } | void>({
      query: (params) => ({ url: '', params: params || {} }),
      providesTags: ['Documents'],
      transformResponse: (response: ApiResponse<SharedDocument[]>) => response.data || [],
    }),
    uploadDocument: builder.mutation<SharedDocument, Partial<SharedDocument>>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Documents'],
      transformResponse: (response: ApiResponse<SharedDocument>) => response.data as SharedDocument,
    }),
  }),
});

export const { useGetDocumentsQuery, useUploadDocumentMutation } = documentsApi;
