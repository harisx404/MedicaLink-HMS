import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  FileText,
  ArrowRight
} from 'lucide-react';
import { useListPurchaseOrdersQuery } from '../api/pharmacyApi';
import { CreatePOModal } from '../components/CreatePOModal';
import { ReceiveGRNModal } from '../components/ReceiveGRNModal';

export const PurchaseOrders: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [grnModalState, setGrnModalState] = useState<{isOpen: boolean, po: any}>({ isOpen: false, po: null });
  const { data, isLoading } = useListPurchaseOrdersQuery({ status: statusFilter || undefined });
  
  const orders = data?.data || [];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-700';
      case 'ORDERED': return 'bg-blue-100 text-blue-700';
      case 'PARTIAL': return 'bg-amber-100 text-amber-700';
      case 'RECEIVED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-slate-500 mt-1">Manage supplier orders and goods receipt</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm shadow-indigo-200"
        >
          <Plus size={18} className="mr-2" /> Create PO
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by PO number or supplier..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">Status:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['All', 'DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status === 'All' ? '' : status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    (status === 'All' && statusFilter === '') || status === statusFilter
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">PO Number</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Items</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading purchase orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                  <FileText size={32} className="text-slate-300 mb-3" />
                  <p>No purchase orders found</p>
                </td>
              </tr>
            ) : (
              orders.map((po: any) => (
                <tr key={po._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{po.poNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{po.supplier?.name}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(po.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {po.items?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    ${po.totalAmount?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(po.status)}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {po.status === 'ORDERED' || po.status === 'PARTIAL' ? (
                      <button 
                        onClick={() => setGrnModalState({ isOpen: true, po })}
                        className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                      >
                        Receive GRN <ArrowRight size={14} className="ml-1" />
                      </button>
                    ) : (
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreatePOModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      
      <ReceiveGRNModal 
        isOpen={grnModalState.isOpen} 
        po={grnModalState.po}
        onClose={() => setGrnModalState({ isOpen: false, po: null })} 
      />
    </div>
  );
};
