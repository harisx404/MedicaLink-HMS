import React from 'react';
import { useGetClinicalMetricsQuery } from '../api/analyticsApi';
import { PageHeader } from '../../../components/common';
import { AnalyticsNavigation } from '../components/AnalyticsNavigation';
import { Loader2, HeartPulse, Stethoscope, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ClinicalAnalytics: React.FC = () => {
  const { data: metricsRes, isLoading } = useGetClinicalMetricsQuery();
  const metrics = metricsRes?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { topDiagnoses, readmissionRate, mortalityRate } = metrics || {};

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Clinical Analytics" 
        description="Patient health outcomes and clinical quality metrics"
      />
      <AnalyticsNavigation />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Readmission Rate (30-day)</p>
            <h3 className="text-2xl font-bold text-gray-900">{readmissionRate || 0}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Mortality Rate</p>
            <h3 className="text-2xl font-bold text-gray-900">{mortalityRate || 0}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sepsis Alerts (MTD)</p>
            <h3 className="text-2xl font-bold text-gray-900">12</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Top 10 Diagnoses</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topDiagnoses || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
