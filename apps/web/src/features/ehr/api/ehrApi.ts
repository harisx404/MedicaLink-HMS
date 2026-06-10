import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { ApiResponse } from '../../../types';
import type { SharedConsultation, SharedPrescription } from '@medicalink/shared';
import type { ICD10Code, DrugFormulary } from '@medicalink/shared';

export const ehrApi = createApi({
  reducerPath: 'ehrApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      const tenantSlug = (getState() as RootState).auth.tenantSlug;
      if (token) headers.set('authorization', `Bearer ${token}`);
      if (tenantSlug) headers.set('x-tenant-slug', tenantSlug);
      return headers;
    },
  }),
  tagTypes: ['Consultation', 'Prescription', 'Reference'],
  endpoints: (builder) => ({
    
    // Consultations
    startConsultation: builder.mutation<ApiResponse<SharedConsultation>, { appointmentId: string, patientId: string, visitType: string, departmentId: string }>({
      query: (body) => ({
        url: '/consultations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Consultation'],
    }),
    getConsultation: builder.query<ApiResponse<SharedConsultation>, string>({
      query: (id) => `/consultations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Consultation', id }],
    }),
    updateConsultation: builder.mutation<ApiResponse<SharedConsultation>, { id: string, data: Partial<SharedConsultation> }>({
      query: ({ id, data }) => ({
        url: `/consultations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Consultation', id }],
    }),
    signConsultation: builder.mutation<ApiResponse<SharedConsultation>, string>({
      query: (id) => ({
        url: `/consultations/${id}/sign`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Consultation', id }],
    }),
    getPatientConsultations: builder.query<ApiResponse<SharedConsultation[]>, string>({
      query: (patientId) => `/consultations/patient/${patientId}`,
      providesTags: ['Consultation'],
    }),

    // Prescriptions
    createPrescription: builder.mutation<ApiResponse<SharedPrescription>, any>({
      query: (body) => ({
        url: '/prescriptions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Prescription', 'Consultation'],
    }),
    getPrescription: builder.query<ApiResponse<SharedPrescription>, string>({
      query: (id) => `/prescriptions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Prescription', id }],
    }),

    // References
    searchICD10: builder.query<ApiResponse<ICD10Code[]>, string>({
      query: (q) => `/references/icd10/search?q=${q}`,
      keepUnusedDataFor: 300,
    }),
    searchDrugs: builder.query<ApiResponse<DrugFormulary[]>, string>({
      query: (q) => `/references/drugs/search?q=${q}`,
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useStartConsultationMutation,
  useGetConsultationQuery,
  useUpdateConsultationMutation,
  useSignConsultationMutation,
  useGetPatientConsultationsQuery,
  useCreatePrescriptionMutation,
  useGetPrescriptionQuery,
  useSearchICD10Query,
  useSearchDrugsQuery,
  useLazySearchICD10Query,
  useLazySearchDrugsQuery
} = ehrApi;
