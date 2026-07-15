import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store/store';

export interface RadiologyOrder {
  _id: string;
  orderNumber: string;
  patient: any;
  doctor: any;
  modality: string;
  bodyPart: string;
  urgency: string;
  status: string;
  createdAt: string;
}

export interface DicomStudy {
  _id: string;
  studyInstanceUID: string;
  modality: string;
  seriesCount: number;
  imageCount: number;
}

export interface RadiologyReport {
  _id: string;
  findings: string;
  impression: string;
  status: string;
  reportedBy: any;
  criticalFindings?: boolean;
}

export const radiologyApi = createApi({
  reducerPath: 'radiologyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
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
  tagTypes: ['RadiologyOrder', 'DicomStudy', 'RadiologyReport'],
  endpoints: (builder) => ({
    getRadiologyOrders: builder.query<{ success: boolean; data: RadiologyOrder[] }, any>({
      query: (params) => ({
        url: '/radiology/orders',
        params,
      }),
      providesTags: ['RadiologyOrder'],
    }),
    getRadiologyOrderById: builder.query<{ success: boolean; data: RadiologyOrder }, string>({
      query: (id) => `/radiology/orders/${id}`,
      providesTags: (_result, _error, id: string) => [{ type: 'RadiologyOrder', id }],
    }),
    updateOrderStatus: builder.mutation<{ success: boolean; data: RadiologyOrder }, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/radiology/orders/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['RadiologyOrder'],
    }),
    getStudyByOrderId: builder.query<{ success: boolean; data: DicomStudy }, string>({
      query: (orderId) => `/radiology/orders/${orderId}/study`,
      providesTags: (_result, _error, id: string) => [{ type: 'DicomStudy', id }],
    }),
    uploadDicomStudy: builder.mutation<{ success: boolean; data: DicomStudy }, { orderId: string; data: Partial<DicomStudy> }>({
      query: ({ orderId, data }) => ({
        url: `/radiology/orders/${orderId}/images`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RadiologyOrder', 'DicomStudy'],
    }),
    getReportByOrderId: builder.query<{ success: boolean; data: RadiologyReport }, string>({
      query: (orderId) => `/radiology/orders/${orderId}/reports`,
      providesTags: (_result, _error, id: string) => [{ type: 'RadiologyReport', id }],
    }),
    saveReport: builder.mutation<{ success: boolean; data: RadiologyReport }, { orderId: string; data: Partial<RadiologyReport> }>({
      query: ({ orderId, data }) => ({
        url: `/radiology/orders/${orderId}/reports`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RadiologyOrder', 'RadiologyReport'],
    }),
  }),
});

export const {
  useGetRadiologyOrdersQuery,
  useGetRadiologyOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useGetStudyByOrderIdQuery,
  useUploadDicomStudyMutation,
  useGetReportByOrderIdQuery,
  useSaveReportMutation,
} = radiologyApi;
