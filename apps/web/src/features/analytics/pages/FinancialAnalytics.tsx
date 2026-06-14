import React from 'react';
import { useGetFinancialMetricsQuery } from '../api/analyticsApi';
import { PageHeader } from '../../../components/common';
import { AnalyticsNavigation } from '../components/AnalyticsNavigation';
import { Loader2, DollarSign, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export const FinancialAnalytics: React.FC = () => {
  const { data: metricsRes, isLoading } = useGetFinancialMetricsQuery();
  const metrics = metricsRes?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { payerSplit, collectionEfficiency } = metrics || {};
  const COLORS = ['#10b981', '#6366f1', '#f59e0b'];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Financial Analytics" 
        description="Revenue breakdown and collection metrics"
      />
      <AnalyticsNavigation />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Collection Efficiency</p>
            <h3 className="text-2xl font-bold text-gray-900">{collectionEfficiency?.toFixed(1) || 0}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <PieChartIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Insurance vs Cash</p>
            <h3 className="text-2xl font-bold text-gray-900">65 / 35</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Revenue per Bed Day</p>
            <h3 className="text-2xl font-bold text-gray-900">$450</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue by Payer</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payerSplit || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                  dataKey="value"
                >
                  {(payerSplit || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Claims Denial Reasons</h3>
          <div className="flex flex-col items-center justify-center h-80 text-gray-500">
            <p>Data pending from Insurance Module</p>
          </div>
        </div>
      </div>
    </div>
  );
};
