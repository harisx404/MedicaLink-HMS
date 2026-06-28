import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { 
  ApiResponse, 
  SharedMessage,
  SendMessagePayload
} from '@medicalink/shared';

export interface InboxItem {
  _id: string; // The contact's user ID
  latestMessage: SharedMessage;
  unreadCount: number;
  contact: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    designation?: string;
    role: string;
  };
}

export interface StaffSearchResult {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  designation?: string;
  role: string;
}

export const messageApi = createApi({
  reducerPath: 'messageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/messages',
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
  tagTypes: ['Inbox', 'Conversation'],
  endpoints: (builder) => ({
    getInbox: builder.query<ApiResponse<InboxItem[]>, void>({
      query: () => '/inbox',
      providesTags: ['Inbox'],
    }),
    getConversation: builder.query<ApiResponse<SharedMessage[]>, { otherUserId: string; page?: number; limit?: number }>({
      query: ({ otherUserId, page, limit }) => ({
        url: `/${otherUserId}`,
        params: { page, limit }
      }),
      providesTags: (_result, _error, { otherUserId }) => [{ type: 'Conversation', id: otherUserId }],
    }),
    sendMessage: builder.mutation<ApiResponse<SharedMessage>, SendMessagePayload>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { receiverId }) => [
        'Inbox', 
        { type: 'Conversation', id: receiverId }
      ],
    }),
    searchStaff: builder.query<ApiResponse<StaffSearchResult[]>, string>({
      query: (q) => ({
        url: '/search-staff',
        params: { q }
      }),
    }),
  }),
});

export const {
  useGetInboxQuery,
  useGetConversationQuery,
  useSendMessageMutation,
  useLazySearchStaffQuery,
} = messageApi;
