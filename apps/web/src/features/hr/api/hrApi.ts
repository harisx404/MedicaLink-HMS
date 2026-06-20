import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { 
  ApiResponse, 
  SharedEmployee, 
  SharedAttendance, 
  SharedLeave, 
  SharedPayroll 
} from '@medicalink/shared';
import type { HRDashboardStats } from '../types/hr.types';

export interface BulkAttendanceRecord {
  employeeId: string;
  status: string;
  notes?: string;
}

export interface CheckInLocation {
  lat: number;
  lng: number;
}

export const hrApi = createApi({
  reducerPath: 'hrApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/hr',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      const subdomain = window.location.hostname.split('.')[0];
      if (subdomain !== 'localhost' && subdomain !== '127') {
        headers.set('X-Tenant-Slug', subdomain);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Employee', 'Attendance', 'Leave', 'Payroll', 'Schedule', 'Performance'],
  endpoints: (builder) => ({
    getHRDashboardStats: builder.query<ApiResponse<HRDashboardStats>, void>({
      query: () => '/dashboard',
      providesTags: ['Employee', 'Attendance', 'Leave'],
    }),

    // Employee Endpoints
    getEmployees: builder.query<ApiResponse<SharedEmployee[]>, { department?: string; designation?: string }>({
      query: (params) => ({
        url: '/employees',
        params,
      }),
      providesTags: ['Employee'],
    }),
    getEmployeeById: builder.query<ApiResponse<SharedEmployee>, string>({
      query: (id) => `/employees/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Employee', id }],
    }),
    createEmployee: builder.mutation<ApiResponse<SharedEmployee>, Partial<SharedEmployee>>({
      query: (body) => ({
        url: '/employees',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation<ApiResponse<SharedEmployee>, { id: string; data: Partial<SharedEmployee> }>({
      query: ({ id, data }) => ({
        url: `/employees/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, 'Employee'],
    }),

    // Attendance Endpoints
    getAttendance: builder.query<ApiResponse<SharedAttendance[]>, { date?: string }>({
      query: (params) => ({
        url: '/attendance',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    bulkMarkAttendance: builder.mutation<ApiResponse<{ count: number }>, { date: string; records: BulkAttendanceRecord[] }>({
      query: (body) => ({
        url: '/attendance/mark',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),
    checkIn: builder.mutation<ApiResponse<SharedAttendance>, { method: string; location?: CheckInLocation }>({
      query: (body) => ({
        url: '/attendance/check-in',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Leave Endpoints
    getLeaves: builder.query<ApiResponse<SharedLeave[]>, { status?: string; employeeId?: string }>({
      query: (params) => ({
        url: '/leaves',
        params,
      }),
      providesTags: ['Leave'],
    }),
    applyLeave: builder.mutation<ApiResponse<SharedLeave>, Partial<SharedLeave>>({
      query: (body) => ({
        url: '/leaves',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leave'],
    }),
    approveLeave: builder.mutation<ApiResponse<SharedLeave>, { id: string; status: string; comment?: string }>({
      query: ({ id, status, comment }) => ({
        url: `/leaves/${id}/approve`,
        method: 'PUT',
        body: { status, comment },
      }),
      invalidatesTags: ['Leave'],
    }),

    // Payroll Endpoints
    getPayrolls: builder.query<ApiResponse<SharedPayroll[]>, { month?: number; year?: number; status?: string }>({
      query: (params) => ({
        url: '/payroll',
        params,
      }),
      providesTags: ['Payroll'],
    }),
    generatePayrollDraft: builder.mutation<ApiResponse<SharedPayroll>, { employeeId: string; month: number; year: number }>({
      query: (body) => ({
        url: '/payroll/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payroll'],
    }),
    approvePayroll: builder.mutation<ApiResponse<SharedPayroll>, string>({
      query: (id) => ({
        url: `/payroll/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Payroll'],
    }),
  }),
});

export const {
  useGetHRDashboardStatsQuery,
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useGetAttendanceQuery,
  useBulkMarkAttendanceMutation,
  useCheckInMutation,
  useGetLeavesQuery,
  useApplyLeaveMutation,
  useApproveLeaveMutation,
  useGetPayrollsQuery,
  useGeneratePayrollDraftMutation,
  useApprovePayrollMutation,
} = hrApi;
