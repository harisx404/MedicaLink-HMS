import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store/store';
import type { SharedVitals, ApiResponse } from '@medicalink/shared';

export interface NursingNote {
  _id: string;
  tenantId: string;
  patient: string;
  nurse: { _id: string; firstName: string; lastName: string; role: string };
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  note: string;
  createdAt: string;
}

export interface Handover {
  _id: string;
  ward: string;
  shiftFrom: { _id: string; firstName: string; lastName: string };
  shiftTo: { _id: string; firstName: string; lastName: string };
  report: string;
  criticalPatients: Array<{ _id: string; firstName: string; lastName: string; uhid: string }>;
  createdAt: string;
}

export interface MARData {
  prescriptions: any[]; 
  history: Array<{
    _id: string;
    drugName: string;
    dose: string;
    route: string;
    administeredBy: { _id: string; firstName: string; lastName: string };
    administeredAt: string;
    status: 'GIVEN' | 'HELD' | 'REFUSED';
    notes?: string;
  }>;
}

export const nursingApi = createApi({
  reducerPath: 'nursingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/nursing',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const subdomain = window.location.hostname.split('.')[0];
      headers.set('X-Tenant-Slug', subdomain);
      return headers;
    },
  }),
  tagTypes: ['Vitals', 'NursingNotes', 'MAR', 'Handover'],
  endpoints: (builder) => ({
    getPatientVitals: builder.query<ApiResponse<SharedVitals[]>, string>({
      query: (patientId) => `/vitals/${patientId}`,
      providesTags: ['Vitals'],
    }),
    recordVitals: builder.mutation<ApiResponse<SharedVitals>, Partial<SharedVitals>>({
      query: (vitals) => ({
        url: '/vitals',
        method: 'POST',
        body: vitals,
      }),
      invalidatesTags: ['Vitals'],
    }),
    getPatientNotes: builder.query<ApiResponse<NursingNote[]>, string>({
      query: (patientId) => `/notes/${patientId}`,
      providesTags: ['NursingNotes'],
    }),
    addNursingNote: builder.mutation<ApiResponse<NursingNote>, Partial<NursingNote>>({
      query: (note) => ({
        url: '/notes',
        method: 'POST',
        body: note,
      }),
      invalidatesTags: ['NursingNotes'],
    }),
    getPatientMAR: builder.query<ApiResponse<MARData>, string>({
      query: (patientId) => `/mar/${patientId}`,
      providesTags: ['MAR'],
    }),
    administerMedication: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/mar',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MAR'],
    }),
    getWardHandovers: builder.query<ApiResponse<Handover[]>, string>({
      query: (wardId) => `/handover/${wardId}`,
      providesTags: ['Handover'],
    }),
    submitHandover: builder.mutation<ApiResponse<Handover>, Partial<Handover>>({
      query: (data) => ({
        url: '/handover',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Handover'],
    }),
  }),
});

export const {
  useGetPatientVitalsQuery,
  useRecordVitalsMutation,
  useGetPatientNotesQuery,
  useAddNursingNoteMutation,
  useGetPatientMARQuery,
  useAdministerMedicationMutation,
  useGetWardHandoversQuery,
  useSubmitHandoverMutation,
} = nursingApi;
