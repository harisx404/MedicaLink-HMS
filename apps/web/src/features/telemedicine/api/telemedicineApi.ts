import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TeleconsultationStatus } from '@medicalink/shared';
import type { ITeleconsultationSession } from '@medicalink/shared';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const telemedicineApi = createApi({
  reducerPath: 'telemedicineApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/telemedicine',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['TelemedicineSession'],
  endpoints: (builder) => ({
    getSessions: builder.query<ApiResponse<ITeleconsultationSession[]>, void>({
      query: () => '/sessions',
      providesTags: ['TelemedicineSession'],
    }),
    getSessionById: builder.query<ApiResponse<ITeleconsultationSession>, string>({
      query: (id) => `/sessions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'TelemedicineSession', id }],
    }),
    createSession: builder.mutation<ApiResponse<ITeleconsultationSession>, Partial<ITeleconsultationSession>>({
      query: (body) => ({
        url: '/sessions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TelemedicineSession'],
    }),
    updateSessionStatus: builder.mutation<ApiResponse<ITeleconsultationSession>, { id: string, status: TeleconsultationStatus }>({
      query: ({ id, status }) => ({
        url: `/sessions/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'TelemedicineSession', id }, 'TelemedicineSession'],
    }),
  }),
});

export const {
  useGetSessionsQuery,
  useGetSessionByIdQuery,
  useCreateSessionMutation,
  useUpdateSessionStatusMutation,
} = telemedicineApi;
