import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Clock, 
  Printer, 
  Droplet,
  CheckCircle
} from 'lucide-react';
import { useListLabOrdersQuery, useCollectSampleMutation } from '../api/labApi';

export const SampleCollection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useListLabOrdersQuery({ status: 'ORDERED' });
  const [collectSample, { isLoading: isCollecting }] = useCollectSampleMutation();
  
  const orders = data?.data || [];
  
  const filteredOrders = orders.filter((order: any) => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patient?.uhid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCollect = async (orderId: string) => {
    try {
      // In a real app, we'd open a modal to scan barcode
      const sampleBarcode = `SMPL-${orderId.slice(-6).toUpperCase()}`;
      await collectSample({ id: orderId, sampleBarcode }).unwrap();
      // Show success toast here
    } catch (error) {
      console.error('Failed to collect sample', error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sample Collection Workstation</h1>
          <p className="text-slate-500 mt-1">Pending orders awaiting sample collection</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Patient Name, UHID or Order Number..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Total Pending:</span>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold rounded-full">{orders.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Patient Info</th>
                <th className="px-6 py-4">Required Tests</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading pending orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                    <CheckCircle size={32} className="text-emerald-400 mb-3" />
                    <p>No pending sample collections</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-indigo-600">{order.orderNumber}</div>
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        <Clock size={12} className="mr-1" />
                        {new Date(order.orderDate).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 flex items-center">
                        <User size={14} className="mr-1.5 text-slate-400" />
                        {order.patient?.firstName} {order.patient?.lastName}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">UHID: {order.patient?.uhid}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {order.tests?.map((t: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                            {t.testName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.urgency === 'STAT' ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">STAT</span>
                      ) : order.urgency === 'URGENT' ? (
                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">URGENT</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">ROUTINE</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Print Barcodes">
                          <Printer size={18} />
                        </button>
                        <button 
                          onClick={() => handleCollect(order._id!)}
                          disabled={isCollecting}
                          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm disabled:opacity-50"
                        >
                          <Droplet size={16} className="mr-2" /> Collect Sample
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
