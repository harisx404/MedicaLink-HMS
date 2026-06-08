import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store/store';

export const hospitalAdminApi = createApi({
  reducerPath: 'hospitalAdminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/admin',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      const tenantSlug = state.auth.tenantSlug;
      if (tenantSlug) {
        headers.set('X-Tenant-Slug', tenantSlug);
      }
      return headers;
    },
  }),
  tagTypes: ['Dashboard', 'Users', 'Departments', 'Wards', 'Beds', 'Settings', 'Roles', 'DashboardStats'],
  endpoints: (builder) => ({
    // Dashboard Stats
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['DashboardStats'],
    }),

    // Settings
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation({
      query: (data) => ({
        url: '/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Departments
    getDepartments: builder.query({
      query: () => '/departments',
      providesTags: ['Departments'],
    }),
    createDepartment: builder.mutation({
      query: (data) => ({
        url: '/departments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Departments', 'DashboardStats'],
    }),
    updateDepartment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/departments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Departments'],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Departments', 'DashboardStats'],
    }),

    // Users (Staff)
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    createUser: builder.mutation({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users', 'DashboardStats'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'DashboardStats'],
    }),

    // Wards
    getWards: builder.query({
      query: () => '/wards',
      providesTags: ['Wards'],
    }),
    createWard: builder.mutation({
      query: (data) => ({
        url: '/wards',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wards', 'DashboardStats'],
    }),
    updateWard: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/wards/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Wards'],
    }),
    deleteWard: builder.mutation({
      query: (id) => ({
        url: `/wards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wards', 'DashboardStats'],
    }),

    // Beds
    getBeds: builder.query({
      query: (wardId?: string) => (wardId ? `/beds?wardId=${wardId}` : '/beds'),
      providesTags: ['Beds'],
    }),
    createBed: builder.mutation({
      query: (data) => ({
        url: '/beds',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Beds', 'DashboardStats'],
    }),
    generateBeds: builder.mutation({
      query: (data) => ({
        url: '/beds/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Beds', 'DashboardStats'],
    }),
    updateBed: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/beds/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Beds', 'DashboardStats'],
    }),
    deleteBed: builder.mutation({
      query: (id) => ({
        url: `/beds/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Beds', 'DashboardStats'],
    }),
    // ==========================================
    // ROLES (Custom Permissions)
    // ==========================================
    getRoles: builder.query<any, void>({
      query: () => '/roles',
      providesTags: ['Roles'],
    }),
    createRole: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: '/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles'],
    }),
    updateRole: builder.mutation<any, { id: string; data: Partial<any> }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Roles'],
    }),
    deleteRole: builder.mutation<any, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetWardsQuery,
  useCreateWardMutation,
  useUpdateWardMutation,
  useDeleteWardMutation,
  useGetBedsQuery,
  useCreateBedMutation,
  useGenerateBedsMutation,
  useUpdateBedMutation,
  useDeleteBedMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = hospitalAdminApi;
