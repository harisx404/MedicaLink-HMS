import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { ApiResponse, SharedPatient } from '@medicalink/shared';

// Define query argument interfaces
export interface GetPatientsQueryParams {
  q?: string;
  gender?: string;
  bloodGroup?: string;
  registrationType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/patients',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      
      // The tenantId field holds the slug in AuthUser in the frontend right now based on our design
      // Or we can rely on standard interceptors, but we explicitly pass it for multi-tenant isolation
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Always pass the current tenant slug from the URL or state
      const subdomain = window.location.hostname.split('.')[0];
      headers.set('X-Tenant-Slug', subdomain);
      
      return headers;
    },
  }),
  tagTypes: ['Patient', 'PatientDetails'],
  endpoints: (builder) => ({
    getPatients: builder.query<ApiResponse<SharedPatient[]>, GetPatientsQueryParams>({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Patient' as const, id })),
              { type: 'Patient', id: 'LIST' },
            ]
          : [{ type: 'Patient', id: 'LIST' }],
    }),

    getPatientById: builder.query<ApiResponse<{ patient: SharedPatient }>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'PatientDetails', id }],
    }),

    registerPatient: builder.mutation<ApiResponse<{ patient: SharedPatient }>, Partial<SharedPatient>>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Patient', id: 'LIST' }],
    }),

    updatePatient: builder.mutation<ApiResponse<{ patient: SharedPatient }>, { id: string; data: Partial<SharedPatient> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Patient', id },
        { type: 'PatientDetails', id },
      ],
    }),

    deletePatient: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Patient', id },
        { type: 'Patient', id: 'LIST' },
      ],
    }),
    
    enablePatientPortal: builder.mutation<ApiResponse<{ patient: SharedPatient }>, string>({
      query: (id) => ({
        url: `/${id}/portal/enable`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'PatientDetails', id }],
    }),
    
    generateQrCode: builder.query<ApiResponse<{ qrCode: string }>, string>({
      query: (id) => `/${id}/qr-code`,
    }),
    
    generateClinicalSummary: builder.query<ApiResponse<{ summary: string }>, string>({
      query: (id) => `/${id}/clinical-summary`,
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useRegisterPatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useEnablePatientPortalMutation,
  useGenerateQrCodeQuery,
  useGenerateClinicalSummaryQuery,
} = patientApi;
