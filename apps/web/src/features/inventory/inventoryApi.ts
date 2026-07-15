import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  ApiResponse, 
  IInventoryItem, 
  IAssetRecord, 
  IStockTransaction, 
  IGeneralPurchaseOrder, 
  IVendor 
} from '@medicalink/shared';

const getBaseUrl = () => {
  const env = import.meta.env;
  return env.VITE_API_URL || 'http://localhost:5000/api/v1';
};

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/inventory`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['InventoryItem', 'Asset', 'StockTransaction', 'PurchaseOrder', 'Vendor', 'InventoryReport'],
  endpoints: (builder) => ({
    // Items
    getInventoryItems: builder.query<ApiResponse<IInventoryItem[]>, { category?: string; isAsset?: boolean; status?: string } | void>({
      query: (params) => ({ url: '/', params: params || {} }),
      providesTags: ['InventoryItem'],
    }),
    createInventoryItem: builder.mutation<ApiResponse<IInventoryItem>, Partial<IInventoryItem>>({
      query: (body) => ({ url: '/', method: 'POST', body }),
      invalidatesTags: ['InventoryItem', 'InventoryReport'],
    }),
    updateInventoryItem: builder.mutation<ApiResponse<IInventoryItem>, { id: string; data: Partial<IInventoryItem> }>({
      query: ({ id, data }) => ({ url: `/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['InventoryItem', 'InventoryReport'],
    }),
    getLowStockItems: builder.query<ApiResponse<IInventoryItem[]>, void>({
      query: () => '/low-stock',
      providesTags: ['InventoryItem'],
    }),

    // Transactions
    getTransactions: builder.query<ApiResponse<IStockTransaction[]>, { item?: string; type?: string; startDate?: string; endDate?: string } | void>({
      query: (params) => ({ url: '/transactions', params: params || {} }),
      providesTags: ['StockTransaction'],
    }),
    issueStock: builder.mutation<ApiResponse<{ item: IInventoryItem, transaction: IStockTransaction }>, { item: string; quantity: number; department?: string; reference?: string; notes?: string }>({
      query: (body) => ({ url: '/issue', method: 'POST', body }),
      invalidatesTags: ['InventoryItem', 'StockTransaction', 'InventoryReport'],
    }),
    receiveStock: builder.mutation<ApiResponse<{ item: IInventoryItem, transaction: IStockTransaction }>, { item: string; quantity: number; unitCost?: number; reference?: string; notes?: string }>({
      query: (body) => ({ url: '/receive', method: 'POST', body }),
      invalidatesTags: ['InventoryItem', 'StockTransaction', 'InventoryReport'],
    }),
    transferStock: builder.mutation<ApiResponse<{ item: IInventoryItem, transaction: IStockTransaction }>, { item: string; quantity: number; fromDepartment: string; toDepartment: string; reference?: string; notes?: string }>({
      query: (body) => ({ url: '/transfer', method: 'POST', body }),
      invalidatesTags: ['InventoryItem', 'StockTransaction', 'InventoryReport'],
    }),

    // Assets
    getAssets: builder.query<ApiResponse<IAssetRecord[]>, void>({
      query: () => '/assets',
      providesTags: ['Asset'],
    }),
    updateAsset: builder.mutation<ApiResponse<IAssetRecord>, { id: string; data: Partial<IAssetRecord> }>({
      query: ({ id, data }) => ({ url: `/assets/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Asset'],
    }),

    // Purchase Orders
    getPurchaseOrders: builder.query<ApiResponse<IGeneralPurchaseOrder[]>, void>({
      query: () => '/purchase-orders',
      providesTags: ['PurchaseOrder'],
    }),
    createPurchaseOrder: builder.mutation<ApiResponse<IGeneralPurchaseOrder>, { poNumber: string; vendor: string; items: { item: string; quantity: number; unitRate: number }[] }>({
      query: (body) => ({ url: '/purchase-orders', method: 'POST', body }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Vendors
    getVendors: builder.query<ApiResponse<IVendor[]>, void>({
      query: () => '/vendors',
      providesTags: ['Vendor'],
    }),
    createVendor: builder.mutation<ApiResponse<IVendor>, Partial<IVendor>>({
      query: (body) => ({ url: '/vendors', method: 'POST', body }),
      invalidatesTags: ['Vendor'],
    }),

    // Reports
    getStockValuation: builder.query<ApiResponse<{ byCategory: any[]; total: number }>, void>({
      query: () => '/reports/stock-valuation',
      providesTags: ['InventoryReport'],
    }),
    getConsumption: builder.query<ApiResponse<any[]>, void>({
      query: () => '/reports/consumption',
      providesTags: ['InventoryReport'],
    }),
  }),
});

export const {
  useGetInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useGetLowStockItemsQuery,
  useGetTransactionsQuery,
  useIssueStockMutation,
  useReceiveStockMutation,
  useTransferStockMutation,
  useGetAssetsQuery,
  useUpdateAssetMutation,
  useGetPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useGetVendorsQuery,
  useCreateVendorMutation,
  useGetStockValuationQuery,
  useGetConsumptionQuery,
} = inventoryApi;
