import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { SharedAppointment } from '@medicalink/shared';

// We get access to the global socket from our store/socket logic if needed,
// but RTK query handles cache entry lifecycle via onCacheEntryAdded.
// We'll import socket from a central location if needed, or we can listen via useEffect in components.

export const appointmentApi = createApi({
  reducerPath: 'appointmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Appointment', 'Queue', 'AppointmentSlot'],
  endpoints: (builder) => ({
    getAppointments: builder.query<{ success: boolean; data: SharedAppointment[] }, any>({
      query: (params) => ({
        url: '/appointments',
        params,
      }),
      providesTags: ['Appointment'],
    }),

    getDoctorQueue: builder.query<{ success: boolean; data: SharedAppointment[] }, { doctorId: string; date: string }>({
      query: ({ doctorId, date }: { doctorId: string; date: string }) => ({
        url: `/doctors/${doctorId}/queue`,
        params: { date },
      }),
      providesTags: (_result: any, _error: any, arg: any) => [{ type: 'Queue', id: `${arg.doctorId}-${arg.date}` }],
      // onCacheEntryAdded allows listening to socket events while this query is active
      async onCacheEntryAdded(_arg: any, { cacheDataLoaded, cacheEntryRemoved }: any) {
        try {
          await cacheDataLoaded;
          // In a real app, you might import your socket instance here and attach a listener
          // socket.on('queue-updated', (updatedAppointment) => {
          //   updateCachedData((draft) => {
          //     const index = draft.data.findIndex(a => a._id === updatedAppointment._id);
          //     if (index !== -1) draft.data[index] = updatedAppointment;
          //   });
          // });
        } catch {
          // no-op
        }
        await cacheEntryRemoved;
      }
    }),

    getAvailableSlots: builder.query<{ success: boolean; data: any[] }, { doctorId: string; date: string }>({
      query: ({ doctorId, date }: { doctorId: string; date: string }) => ({
        url: `/doctors/${doctorId}/slots`,
        params: { date },
      }),
      providesTags: ['AppointmentSlot'],
    }),

    bookAppointment: builder.mutation<{ success: boolean; data: SharedAppointment }, any>({
      query: (body: any) => ({
        url: '/appointments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Appointment', 'AppointmentSlot', 'Queue'],
    }),

    updateAppointmentStatus: builder.mutation<{ success: boolean; data: SharedAppointment }, any>({
      query: ({ id, ...body }: any) => ({
        url: `/appointments/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Appointment', 'Queue'],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetDoctorQueueQuery,
  useGetAvailableSlotsQuery,
  useBookAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} = appointmentApi;
