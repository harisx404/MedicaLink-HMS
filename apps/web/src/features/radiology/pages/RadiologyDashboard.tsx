import React from 'react';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { useGetRadiologyOrdersQuery } from '../radiologyApi';
import { Activity, Clock, FileCheck, Monitor } from 'lucide-react';

export const RadiologyDashboard: React.FC = () => {
  const { data, isLoading } = useGetRadiologyOrdersQuery({});
  
  const orders = data?.data || [];
  const pendingScans = orders.filter(o => o.status === 'SCHEDULED' || o.status === 'ORDERED').length;
  const pendingReports = orders.filter(o => o.status === 'IMAGES_UPLOADED').length;
  const completedToday = orders.filter(o => o.status === 'VERIFIED').length;

  return (
    <PageWrapper title="Radiology Dashboard">
      <div className="space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-blue-100 bg-blue-50/50 rounded-xl shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Pending Scans</p>
                  <p className="text-3xl font-bold text-blue-900">{pendingScans}</p>
                </div>
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border border-amber-100 bg-amber-50/50 rounded-xl shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">To Report</p>
                  <p className="text-3xl font-bold text-amber-900">{pendingReports}</p>
                </div>
                <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 mb-1">Completed Today</p>
                  <p className="text-3xl font-bold text-emerald-900">{completedToday}</p>
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                  <FileCheck className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-purple-100 bg-purple-50/50 rounded-xl shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Active Modalities</p>
                  <p className="text-3xl font-bold text-purple-900">4 / 5</p>
                </div>
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                  <Monitor className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders List Preview */}
        <div className="rounded-xl border shadow-sm bg-white">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No orders found</div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-200 hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {order.patient?.firstName} {order.patient?.lastName}
                      </h4>
                      <div className="text-sm text-slate-500 flex gap-3 mt-1">
                        <span>{order.orderNumber}</span>
                        <span className="font-medium text-slate-700">{order.modality} - {order.bodyPart}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        order.urgency === 'STAT' ? 'bg-red-100 text-red-700' :
                        order.urgency === 'URGENT' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.urgency}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
