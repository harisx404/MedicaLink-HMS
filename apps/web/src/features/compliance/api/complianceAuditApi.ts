import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface IHipaaAuditSummary {
  overallScore: number;
  safeguards: {
    technical: number;
    physical: number;
    administrative: number;
  };
  totalAuditEvents: number;
  recentAccessCount: number;
  signedConsentsCount: number;
  activeComplianceControls: number;
  lastAuditDate: string;
}

export const complianceAuditApi = createApi({
  reducerPath: 'complianceAuditApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/compliance/audit-report`,
    prepareHeaders: (headers, { getState }: any) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAuditReport: builder.query<{ success: boolean; data: IHipaaAuditSummary }, void>({
      query: () => '/',
    }),
  }),
});

export const { useGetAuditReportQuery } = complianceAuditApi;
