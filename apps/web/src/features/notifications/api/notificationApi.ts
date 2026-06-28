import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { 
  ApiResponse, 
  SharedNotification,
  SharedNotificationTemplate,
  NotificationCategory
} from '@medicalink/shared';

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  isRead?: boolean;
}

export interface NotificationsMeta {
  unreadCount: number;
  total: number;
  page: number;
  pages: number;
}

export interface NotificationsResponse extends ApiResponse<SharedNotification[]> {
  meta?: NotificationsMeta;
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/notifications',
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
  tagTypes: ['Notification', 'Template'],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, GetNotificationsParams | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation<ApiResponse<void>, { notificationIds?: string[] }>({
      query: (body) => ({
        url: '/mark-read',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Template Endpoints
    getTemplates: builder.query<ApiResponse<SharedNotificationTemplate[]>, void>({
      query: () => '/templates',
      providesTags: ['Template'],
    }),
    updateTemplate: builder.mutation<ApiResponse<SharedNotificationTemplate>, { id: string; data: Partial<SharedNotificationTemplate> }>({
      query: ({ id, data }) => ({
        url: `/templates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Template'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
  useGetTemplatesQuery,
  useUpdateTemplateMutation,
} = notificationApi;
