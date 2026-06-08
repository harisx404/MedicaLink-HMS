import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { ApiResponse, SharedUser } from '@medicalink/shared';

export const staffApi = createApi({
  reducerPath: 'staffApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/admin/staff',
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
  tagTypes: ['Staff'],
  endpoints: (builder) => ({
    getStaff: builder.query<ApiResponse<SharedUser[]>, { role?: string; search?: string }>({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: ['Staff'],
    }),
  }),
});

export const { useGetStaffQuery } = staffApi;
