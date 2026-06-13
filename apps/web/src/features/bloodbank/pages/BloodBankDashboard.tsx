import React from 'react';
import { useGetInventoryStatsQuery, useGetBloodRequestsQuery } from '../api/bloodBankApi';
import { Droplet, Activity, Users, AlertCircle } from 'lucide-react';
import { BloodGroup, BloodComponentType, BloodRequestStatus } from '@medicalink/shared';

export const BloodBankDashboard: React.FC = () => {
  const { data: statsData, isLoading: isStatsLoading } = useGetInventoryStatsQuery();
  const { data: reqsData } = useGetBloodRequestsQuery();

  const inventoryStats = statsData?.data || [];
  const pendingRequests = (reqsData?.data || []).filter((r: any) => 
    [BloodRequestStatus.PENDING, BloodRequestStatus.CROSS_MATCHING].includes(r.status)
  );

  const bloodGroups = Object.values(BloodGroup);
  const componentTypes = Object.values(BloodComponentType);

  // Build matrix: row=Group, col=Component -> count
  const getCount = (bg: string, ct: string) => {
    const match = inventoryStats.find((s: any) => s._id.group === bg && s._id.type === ct);
    return match ? match.count : 0;
  };

  const getStatusColor = (count: number) => {
    if (count === 0) return 'bg-red-50 text-red-700 font-bold';
    if (count < 5) return 'bg-amber-50 text-amber-700 font-bold';
    return 'bg-emerald-50 text-emerald-700 font-bold';
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
          <Droplet className="text-red-500 mr-2" size={24} fill="currentColor" />
          Blood Bank Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">Real-time inventory levels and pending blood requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4">
            <Droplet size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Available Units</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {inventoryStats.reduce((sum: number, s: any) => sum + s.count, 0)}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Requests</p>
            <h3 className="text-2xl font-bold text-slate-900">{pendingRequests.length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Donors</p>
            <h3 className="text-2xl font-bold text-slate-900">142</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Inventory Matrix</h3>
          </div>
          <div className="overflow-x-auto p-4">
            {isStatsLoading ? (
              <div className="p-8 text-center text-slate-500 animate-pulse">Loading inventory...</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Blood Group</th>
                    {componentTypes.map(ct => (
                      <th key={ct} className="px-4 py-3 text-center">{ct.replace('_', ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bloodGroups.map(bg => (
                    <tr key={bg} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-800 border-r border-slate-100">
                        <span className="flex items-center">
                          <Droplet className="text-red-500 mr-2 opacity-50" size={14} fill="currentColor" /> {bg}
                        </span>
                      </td>
                      {componentTypes.map(ct => {
                        const count = getCount(bg, ct);
                        return (
                          <td key={ct} className={`px-4 py-3 text-center ${getStatusColor(count)}`}>
                            {count}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center">
              <AlertCircle className="text-amber-500 mr-2" size={18} /> Critical Alerts
            </h3>
          </div>
          <div className="p-4 flex-1">
            <ul className="space-y-3">
              {inventoryStats.filter((s: any) => s.count === 0).slice(0, 5).map((s: any, i: number) => (
                <li key={i} className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3">
                  <Droplet className="text-red-500 mt-0.5 shrink-0" size={16} />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Out of Stock</p>
                    <p className="text-xs text-red-600">{s._id.group} - {s._id.type.replace('_', ' ')}</p>
                  </div>
                </li>
              ))}
              {inventoryStats.filter((s: any) => s.count === 0).length === 0 && (
                <div className="text-center text-slate-500 py-8 text-sm">
                  No critical shortages.
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
