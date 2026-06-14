import React from 'react';
import { useGetExecutiveMetricsQuery } from '../api/analyticsApi';
import { PageHeader } from '../../../components/common';
import { MetricCard } from '../components/MetricCard';
import { RevenueChart } from '../components/RevenueChart';
import { AnalyticsNavigation } from '../components/AnalyticsNavigation';
import { DollarSign, Users, Activity, Bed, Loader2, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export const ExecutiveDashboard: React.FC = () => {
  const { data: metricsRes, isLoading } = useGetExecutiveMetricsQuery();
  const metrics = metricsRes?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { kpis, charts, insights } = metrics || {};
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Executive Dashboard" 
        description="High-level overview of hospital performance"
      />
      <AnalyticsNavigation />

      {/* AI Insights Banner */}
      {insights && insights.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-xl p-4 shadow-sm flex gap-4 items-start">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 mt-1">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-indigo-900 mb-2">AI Generated Insights</h4>
            <ul className="space-y-1">
              {insights.map((insight: any, idx: number) => (
                <li key={idx} className="text-sm text-indigo-800 flex items-center before:content-['•'] before:mr-2 before:text-indigo-400">
                  {insight.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue (MTD)"
          value={`$${kpis?.totalRevenue?.toLocaleString() || 0}`}
          trend={kpis?.revenueGrowth}
          trendLabel="vs last month"
          icon={<DollarSign className="h-5 w-5" />}
          chartData={charts?.revenueTrend}
          chartDataKey="revenue"
        />
        <MetricCard 
          title="Bed Occupancy"
          value={`${kpis?.bedOccupancy || 0}%`}
          trend={2.4}
          trendLabel="vs last week"
          icon={<Bed className="h-5 w-5" />}
          chartColor="#10b981"
        />
        <MetricCard 
          title="OPD Patients (MTD)"
          value={kpis?.opdPatients || 0}
          trend={-1.2}
          trendLabel="vs last month"
          icon={<Users className="h-5 w-5" />}
          chartColor="#f59e0b"
        />
        <MetricCard 
          title="Avg Length of Stay"
          value={`${kpis?.alos || 0} days`}
          trend={-5.0}
          trendLabel="vs target"
          icon={<Activity className="h-5 w-5" />}
          chartColor="#ef4444"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2">
          {charts?.revenueTrend && <RevenueChart data={charts.revenueTrend} />}
        </div>

        {/* Department Split Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue by Department</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.departmentSplit || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.departmentSplit || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
