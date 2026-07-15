import React, { useState } from 'react';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { useGetRadiologyOrdersQuery, useUpdateOrderStatusMutation } from '../radiologyApi';
import { useNavigate } from 'react-router-dom';

export const OrderQueue: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({ status: '', modality: '' });
  const { data, isLoading } = useGetRadiologyOrdersQuery(filter);
  const [updateStatus] = useUpdateOrderStatusMutation();

  const orders = data?.data || [];

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ORDERED' ? 'SCHEDULED' : 
                       currentStatus === 'SCHEDULED' ? 'IN_PROGRESS' : 
                       currentStatus === 'IN_PROGRESS' ? 'IMAGES_UPLOADED' : currentStatus;
    if (nextStatus !== currentStatus) {
      await updateStatus({ id, status: nextStatus });
    }
  };

  return (
    <PageWrapper title="Radiology Queue">
      <div className="flex gap-4 mb-6">
        <select 
          className="border rounded-md px-3 py-2 bg-white"
          value={filter.modality}
          onChange={(e) => setFilter(prev => ({ ...prev, modality: e.target.value }))}
        >
          <option value="">All Modalities</option>
          <option value="XRAY">X-Ray</option>
          <option value="CT">CT Scan</option>
          <option value="MRI">MRI</option>
          <option value="USG">Ultrasound</option>
        </select>
        
        <select 
          className="border rounded-md px-3 py-2 bg-white"
          value={filter.status}
          onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="ORDERED">Ordered</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IMAGES_UPLOADED">Images Uploaded</option>
        </select>
      </div>

      <div className="rounded-xl border shadow-sm bg-white overflow-hidden">
        <div className="p-0">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Order Info</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Modality / Part</th>
                <th className="px-6 py-4">Urgency</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">Loading orders...</td>
                </tr>
              ) : orders.map((order: any) => (
                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{order.orderNumber}</td>
                  <td className="px-6 py-4">{order.patient?.firstName} {order.patient?.lastName}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold">{order.modality}</span> — {order.bodyPart}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.urgency === 'STAT' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                      {order.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full border text-xs bg-slate-50">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {order.status !== 'VERIFIED' && order.status !== 'IMAGES_UPLOADED' && (
                      <button 
                        onClick={() => handleStatusChange(order._id, order.status)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Advance Status
                      </button>
                    )}
                    {order.status === 'IMAGES_UPLOADED' && (
                      <button 
                        onClick={() => navigate(`/radiology/reports/${order._id}`)}
                        className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Write Report
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};
