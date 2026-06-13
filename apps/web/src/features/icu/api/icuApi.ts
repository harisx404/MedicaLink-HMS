import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { ApiResponse, IICUPatient, IICUVitalEntry, IICUVentilator, IFluidBalance } from '@medicalink/shared';

export const icuApi = createApi({
  reducerPath: 'icuApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/icu',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      const tenantId = ((getState() as RootState).auth as any).tenantId;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      if (tenantId) {
        headers.set('x-tenant-slug', tenantId);
      }
      return headers;
    },
  }),
  tagTypes: ['ICU'],
  endpoints: (builder) => ({
    getICUPatients: builder.query<ApiResponse<IICUPatient[]>, void>({
      query: () => '/patients',
      providesTags: ['ICU'],
    }),
    getICUPatientById: builder.query<ApiResponse<IICUPatient>, string>({
      query: (id) => `/patients/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ICU', id }],
    }),
    admitToICU: builder.mutation<ApiResponse<IICUPatient>, Partial<IICUPatient>>({
      query: (body) => ({
        url: '/patients',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ICU'],
    }),
    addVitals: builder.mutation<ApiResponse<IICUPatient>, { id: string, vitals: IICUVitalEntry }>({
      query: ({ id, vitals }) => ({
        url: `/patients/${id}/vitals`,
        method: 'POST',
        body: vitals,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ICU', id }],
    }),
    updateVentilator: builder.mutation<ApiResponse<IICUPatient>, { id: string, settings: IICUVentilator }>({
      query: ({ id, settings }) => ({
        url: `/patients/${id}/ventilator`,
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ICU', id }],
    }),
    updateFluidBalance: builder.mutation<ApiResponse<IICUPatient>, { id: string, fluids: IFluidBalance }>({
      query: ({ id, fluids }) => ({
        url: `/patients/${id}/fluids`,
        method: 'POST',
        body: fluids,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ICU', id }],
    })
  }),
});

export const {
  useGetICUPatientsQuery,
  useGetICUPatientByIdQuery,
  useAdmitToICUMutation,
  useAddVitalsMutation,
  useUpdateVentilatorMutation,
  useUpdateFluidBalanceMutation
} = icuApi;
