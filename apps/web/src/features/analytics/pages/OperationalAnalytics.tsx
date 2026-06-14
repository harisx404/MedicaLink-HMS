import React from 'react';
import { useGetOperationalMetricsQuery } from '../api/analyticsApi';
import { PageHeader } from '../../../components/common';
import { AnalyticsNavigation } from '../components/AnalyticsNavigation';
import { Loader2, Activity, Clock, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const OperationalAnalytics: React.FC = () => {
  const { data: metricsRes, isLoading } = useGetOperationalMetricsQuery();
  const metrics = metricsRes?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { doctorProductivity, otUtilization, avgWaitTime } = metrics || {};

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Operational Analytics" 
        description="Hospital workflow and efficiency metrics"
      />
      <AnalyticsNavigation />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">OT Utilization</p>
            <h3 className="text-2xl font-bold text-gray-900">{otUtilization || 0}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg OPD Wait Time</p>
            <h3 className="text-2xl font-bold text-gray-900">{avgWaitTime || 0} min</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Bed Turnover Rate</p>
            <h3 className="text-2xl font-bold text-gray-900">2.1 days</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Doctor Productivity (Consultations MTD)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={doctorProductivity || []} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px' }} />
              <Bar dataKey="consultations" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
