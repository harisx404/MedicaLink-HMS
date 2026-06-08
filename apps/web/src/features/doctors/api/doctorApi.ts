import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { ApiResponse, SharedDoctor } from '@medicalink/shared';
import { getSocket } from '../../../lib/socket';

export interface GetDoctorsQueryParams {
  specialty?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const doctorApi = createApi({
  reducerPath: 'doctorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/doctors',
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
  tagTypes: ['Doctor', 'DoctorDetails', 'DoctorSchedule'],
  endpoints: (builder) => ({
    getDoctors: builder.query<ApiResponse<SharedDoctor[]>, GetDoctorsQueryParams>({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Doctor' as const, id })),
              { type: 'Doctor', id: 'LIST' },
            ]
          : [{ type: 'Doctor', id: 'LIST' }],
      async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const socket = getSocket();
        if (!socket) return;
        
        try {
          await cacheDataLoaded;
          
          const listener = (data: { doctorId: string; status: SharedDoctor['currentStatus'] }) => {
            updateCachedData((draft) => {
              const doctor = draft.data?.find(d => d.id === data.doctorId);
              if (doctor) {
                doctor.currentStatus = data.status;
              }
            });
          };
          
          socket.on('DOCTOR_STATUS_UPDATE', listener);
          
          await cacheEntryRemoved;
          socket.off('DOCTOR_STATUS_UPDATE', listener);
        } catch {
          // no-op if cache entry removed before loaded
        }
      },
    }),

    getDoctorById: builder.query<ApiResponse<{ doctor: SharedDoctor }>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'DoctorDetails', id }],
      async onCacheEntryAdded(id, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const socket = getSocket();
        if (!socket) return;
        
        try {
          await cacheDataLoaded;
          const listener = (data: { doctorId: string; status: SharedDoctor['currentStatus'] }) => {
            if (data.doctorId === id) {
              updateCachedData((draft) => {
                if (draft.data?.doctor) {
                  draft.data.doctor.currentStatus = data.status;
                }
              });
            }
          };
          socket.on('DOCTOR_STATUS_UPDATE', listener);
          await cacheEntryRemoved;
          socket.off('DOCTOR_STATUS_UPDATE', listener);
        } catch (err) {
          // Ignore cache entry removed errors
        }
      },
    }),

    createDoctor: builder.mutation<ApiResponse<{ doctor: SharedDoctor }>, Partial<SharedDoctor>>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),

    updateDoctor: builder.mutation<ApiResponse<{ doctor: SharedDoctor }>, { id: string; data: Partial<SharedDoctor> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Doctor', id },
        { type: 'DoctorDetails', id },
      ],
    }),

    getSchedule: builder.query<ApiResponse<{ schedule: SharedDoctor['weeklySchedule'] }>, string>({
      query: (id) => `/${id}/schedule`,
      providesTags: (_result, _error, id) => [{ type: 'DoctorSchedule', id }],
    }),

    updateSchedule: builder.mutation<ApiResponse<{ doctor: SharedDoctor }>, { id: string; weeklySchedule: SharedDoctor['weeklySchedule'] }>({
      query: ({ id, weeklySchedule }) => ({
        url: `/${id}/schedule`,
        method: 'PUT',
        body: { weeklySchedule },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'DoctorSchedule', id },
        { type: 'DoctorDetails', id },
      ],
    }),

    updateStatus: builder.mutation<ApiResponse<{ doctor: SharedDoctor }>, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Doctor', id },
        { type: 'DoctorDetails', id },
      ],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useGetScheduleQuery,
  useUpdateScheduleMutation,
  useUpdateStatusMutation,
} = doctorApi;
