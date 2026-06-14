import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    chatWithAssistant: builder.mutation<ApiResponse<string>, { message: string; patientContext?: any }>({
      query: (body) => ({
        url: '/clinical-assistant',
        method: 'POST',
        body,
      }),
    }),
    suggestDiagnosis: builder.mutation<ApiResponse<any[]>, { symptoms: string[]; vitals: any }>({
      query: (body) => ({
        url: '/suggest-diagnosis',
        method: 'POST',
        body,
      }),
    }),
    checkDrugInteractions: builder.mutation<ApiResponse<string>, { drugs: string[] }>({
      query: (body) => ({
        url: '/drug-interactions',
        method: 'POST',
        body,
      }),
    }),
    calculateDosage: builder.mutation<ApiResponse<string>, { drug: string; weight: number; age: number; renalFunction?: number }>({
      query: (body) => ({
        url: '/calculate-dosage',
        method: 'POST',
        body,
      }),
    }),
    getDrugInfo: builder.query<ApiResponse<string>, string>({
      query: (drugName) => `/drug-info/${drugName}`,
    }),
    voiceToSoap: builder.mutation<ApiResponse<any>, { transcript: string }>({
      query: (body) => ({
        url: '/voice-to-soap',
        method: 'POST',
        body,
      }),
    }),
    getPatientRiskScore: builder.mutation<ApiResponse<any>, { history: any; vitals: any }>({
      query: (body) => ({
        url: '/patient-risk',
        method: 'POST',
        body,
      }),
    }),
    getLabTrendsSummary: builder.mutation<ApiResponse<string>, { labResults: any[] }>({
      query: (body) => ({
        url: '/summarize-labs',
        method: 'POST',
        body,
      }),
    }),
    generateDischargeSummary: builder.mutation<ApiResponse<string>, { consultationData: any; hospitalCourse: any }>({
      query: (body) => ({
        url: '/discharge-summary',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useChatWithAssistantMutation,
  useSuggestDiagnosisMutation,
  useCheckDrugInteractionsMutation,
  useCalculateDosageMutation,
  useGetDrugInfoQuery,
  useLazyGetDrugInfoQuery,
  useVoiceToSoapMutation,
  useGetPatientRiskScoreMutation,
  useGetLabTrendsSummaryMutation,
  useGenerateDischargeSummaryMutation,
} = aiApi;
