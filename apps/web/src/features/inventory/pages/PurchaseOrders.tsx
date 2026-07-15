import React from 'react';
import { useGetPurchaseOrdersQuery } from '../inventoryApi';
import { ShoppingCart, Plus, FileText, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

export const PurchaseOrders: React.FC = () => {
  const { data: posData, isLoading } = useGetPurchaseOrdersQuery();
  const pos = posData?.data || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="h-4 w-4 text-slate-400" />;
      case 'ORDERED': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'APPROVED': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'RECEIVED': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'PARTIAL': return <Clock className="h-4 w-4 text-amber-400" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-rose-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'ORDERED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'RECEIVED': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'PARTIAL': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Purchase Orders</h1>
          <p className="text-slate-400">Manage procurement of hospital supplies and assets.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none">
          <Plus className="mr-2 h-4 w-4" /> Create PO
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : pos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-4 text-lg font-medium text-white">No purchase orders found</h3>
            <p className="mt-2 text-sm text-slate-400">Create a new purchase order to begin procurement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">PO Number</th>
                  <th scope="col" className="px-6 py-4 font-medium">Vendor</th>
                  <th scope="col" className="px-6 py-4 font-medium">Date</th>
                  <th scope="col" className="px-6 py-4 font-medium">Amount</th>
                  <th scope="col" className="px-6 py-4 font-medium">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pos.map((po) => (
                  <tr key={po._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-white">
                      {po.poNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {typeof po.vendor === 'object' ? (po.vendor as any).name : 'Unknown Vendor'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {po.orderedAt ? new Date(po.orderedAt).toLocaleDateString() : new Date((po as any).createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      ${po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${getStatusColor(po.status)}`}>
                        {getStatusIcon(po.status)}
                        {po.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 font-medium text-sm">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
