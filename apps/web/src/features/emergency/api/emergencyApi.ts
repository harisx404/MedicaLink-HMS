import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { ApiResponse, IEmergencyPatient, IAmbulance } from '@medicalink/shared';

export const emergencyApi = createApi({
  reducerPath: 'emergencyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/emergency',
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
  tagTypes: ['Emergency', 'Ambulance'],
  endpoints: (builder) => ({
    getEmergencyPatients: builder.query<ApiResponse<IEmergencyPatient[]>, { status?: string }>({
      query: (params) => ({
        url: '/patients',
        params
      }),
      providesTags: ['Emergency'],
    }),
    registerEmergencyPatient: builder.mutation<ApiResponse<IEmergencyPatient>, Partial<IEmergencyPatient>>({
      query: (body) => ({
        url: '/patients',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Emergency'],
    }),
    updateTriageStatus: builder.mutation<ApiResponse<IEmergencyPatient>, { id: string, triageLevel: string, triageColor: string }>({
      query: ({ id, ...body }) => ({
        url: `/patients/${id}/triage`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Emergency'],
    }),
    getAmbulances: builder.query<ApiResponse<IAmbulance[]>, void>({
      query: () => '/ambulances',
      providesTags: ['Ambulance'],
    }),
    updateAmbulanceLocation: builder.mutation<ApiResponse<IAmbulance>, { id: string, lat: number, lng: number, currentStatus?: string }>({
      query: ({ id, ...body }) => ({
        url: `/ambulances/${id}/location`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Ambulance'],
    }),
    triggerAlert: builder.mutation<ApiResponse<any>, { type: string, location?: string, details?: string, patientName?: string }>({
      query: (body) => ({
        url: '/alerts/trigger',
        method: 'POST',
        body,
      }),
    }),
    dispatchAmbulance: builder.mutation<ApiResponse<IAmbulance>, { id: string, destination?: string, emergencyPatientId?: string }>({
      query: ({ id, ...body }) => ({
        url: `/ambulances/${id}/dispatch`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Ambulance'],
    }),
  }),
});

export const {
  useGetEmergencyPatientsQuery,
  useRegisterEmergencyPatientMutation,
  useUpdateTriageStatusMutation,
  useGetAmbulancesQuery,
  useUpdateAmbulanceLocationMutation,
  useTriggerAlertMutation,
  useDispatchAmbulanceMutation
} = emergencyApi;
