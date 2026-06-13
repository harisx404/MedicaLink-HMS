import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import type { 
  ApiResponse, 
  IDrug, 
  IDrugBatch, 
  IDispensing, 
  IPurchaseOrder, 
  IGoodsReceiptNote, 
  ISupplier,
  SharedPrescription
} from '@medicalink/shared';

export const pharmacyApi = createApi({
  reducerPath: 'pharmacyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/pharmacy',
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
  tagTypes: ['PharmacyDashboard', 'PrescriptionQueue', 'Drug', 'DrugBatch', 'Dispensing', 'PurchaseOrder', 'Supplier'],
  endpoints: (builder) => ({
    
    // --- Dashboard & Dispensing ---
    getPharmacyDashboard: builder.query<ApiResponse<any>, void>({
      query: () => '/dashboard',
      providesTags: ['PharmacyDashboard']
    }),
    
    getPrescriptionQueue: builder.query<ApiResponse<SharedPrescription[]>, void>({
      query: () => '/queue',
      providesTags: ['PrescriptionQueue']
    }),
    
    dispenseDrugs: builder.mutation<ApiResponse<IDispensing>, any>({
      query: (data: any) => ({
        url: '/dispense',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['PharmacyDashboard', 'PrescriptionQueue', 'Dispensing', 'Drug', 'DrugBatch']
    }),
    
    getDispensingRecord: builder.query<ApiResponse<IDispensing>, string>({
      query: (id: string) => `/dispensing/${id}`,
      providesTags: (_result: any, _error: any, id: string) => [{ type: 'Dispensing', id }]
    }),
    
    processReturn: builder.mutation<ApiResponse<IDispensing>, any>({
      query: (data: any) => ({
        url: '/return',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['PharmacyDashboard', 'Dispensing', 'Drug', 'DrugBatch']
    }),
    
    // --- Drug Inventory ---
    listDrugs: builder.query<ApiResponse<IDrug[]>, { page?: number; limit?: number; category?: string; search?: string }>({
      query: (params: any) => ({
        url: '/drugs',
        params
      }),
      providesTags: ['Drug']
    }),
    
    createDrug: builder.mutation<ApiResponse<IDrug>, Partial<IDrug>>({
      query: (data: any) => ({
        url: '/drugs',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Drug']
    }),
    
    updateDrug: builder.mutation<ApiResponse<IDrug>, { id: string; data: Partial<IDrug> }>({
      query: ({ id, data }: any) => ({
        url: `/drugs/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_result: any, _error: any, { id }: any) => [{ type: 'Drug', id }, 'Drug']
    }),
    
    getDrugBatches: builder.query<ApiResponse<IDrugBatch[]>, string>({
      query: (drugId: string) => `/drugs/${drugId}/batches`,
      providesTags: (_result: any, _error: any, id: string) => [{ type: 'DrugBatch', id }]
    }),
    
    getLowStockDrugs: builder.query<ApiResponse<any[]>, void>({
      query: () => '/inventory/low-stock',
      providesTags: ['Drug']
    }),
    
    getExpiringDrugs: builder.query<ApiResponse<any[]>, { days?: number }>({
      query: (params: any) => ({
        url: '/inventory/expiring',
        params
      }),
      providesTags: ['DrugBatch']
    }),
    
    adjustStock: builder.mutation<ApiResponse<any>, { id: string; data: any }>({
      query: ({ id, data }: any) => ({
        url: `/drugs/${id}/adjust-stock`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Drug', 'DrugBatch', 'PharmacyDashboard']
    }),
    
    // --- Purchase Orders ---
    listPurchaseOrders: builder.query<ApiResponse<IPurchaseOrder[]>, { page?: number; limit?: number; status?: string }>({
      query: (params: any) => ({
        url: '/purchase-orders',
        params
      }),
      providesTags: ['PurchaseOrder']
    }),
    
    createPurchaseOrder: builder.mutation<ApiResponse<IPurchaseOrder>, any>({
      query: (data: any) => ({
        url: '/purchase-orders',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['PurchaseOrder']
    }),
    
    updatePurchaseOrder: builder.mutation<ApiResponse<IPurchaseOrder>, { id: string; data: any }>({
      query: ({ id, data }: any) => ({
        url: `/purchase-orders/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_result: any, _error: any, { id }: any) => [{ type: 'PurchaseOrder', id }, 'PurchaseOrder']
    }),
    
    receiveGoods: builder.mutation<ApiResponse<IGoodsReceiptNote>, { id: string; data: any }>({
      query: ({ id, data }: any) => ({
        url: `/purchase-orders/${id}/receive`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['PurchaseOrder', 'Drug', 'DrugBatch']
    }),
    
    // --- Suppliers ---
    listSuppliers: builder.query<ApiResponse<ISupplier[]>, void>({
      query: () => '/suppliers',
      providesTags: ['Supplier']
    }),
    
    createSupplier: builder.mutation<ApiResponse<ISupplier>, Partial<ISupplier>>({
      query: (data: any) => ({
        url: '/suppliers',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Supplier']
    }),
    
    updateSupplier: builder.mutation<ApiResponse<ISupplier>, { id: string; data: Partial<ISupplier> }>({
      query: ({ id, data }: any) => ({
        url: `/suppliers/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_result: any, _error: any, { id }: any) => [{ type: 'Supplier', id }, 'Supplier']
    })
  })
});

export const {
  useGetPharmacyDashboardQuery,
  useGetPrescriptionQueueQuery,
  useDispenseDrugsMutation,
  useGetDispensingRecordQuery,
  useProcessReturnMutation,
  
  useListDrugsQuery,
  useCreateDrugMutation,
  useUpdateDrugMutation,
  useGetDrugBatchesQuery,
  useGetLowStockDrugsQuery,
  useGetExpiringDrugsQuery,
  useAdjustStockMutation,
  
  useListPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useReceiveGoodsMutation,
  
  useListSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation
} = pharmacyApi;
