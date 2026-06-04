import { 
  Building2, Users, CreditCard, Activity, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';

import { useGetDashboardStatsQuery } from './superAdminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RevenueChart } from '../../components/super-admin/RevenueChart';
import { HealthIndicator } from '../../components/super-admin/HealthIndicator';

export const SuperAdminDashboard = () => {
  const { data: statsResponse, isLoading } = useGetDashboardStatsQuery({});

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" className="text-emerald-500" />
      </div>
    );
  }

  const stats = statsResponse?.data;

  const kpis = [
    { 
      name: 'Total Hospitals', 
      value: stats?.totalTenants || 0, 
      subValue: `${stats?.activeTenants || 0} active`,
      icon: Building2, 
      trend: '+12%', 
      isPositive: true 
    },
    { 
      name: 'Monthly Revenue', 
      value: `$${(stats?.mrr || 0).toLocaleString()}`, 
      subValue: 'MRR',
      icon: CreditCard, 
      trend: '+8.4%', 
      isPositive: true 
    },
    { 
      name: 'Total Users', 
      value: (stats?.totalUsers || 0).toLocaleString(), 
      subValue: `${stats?.activeUsersToday || 0} active today`,
      icon: Users, 
      trend: '+2.1%', 
      isPositive: true 
    },
    { 
      name: 'New Signups', 
      value: stats?.newSignups || 0, 
      subValue: 'This month',
      icon: TrendingUp, 
      trend: '-4%', 
      isPositive: false 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Overview of your SaaS platform performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.name} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">{kpi.name}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{kpi.value}</h3>
                <p className="text-xs text-slate-500 mt-1">{kpi.subValue}</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <kpi.icon className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className={`mt-4 flex items-center text-sm font-medium ${kpi.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {kpi.isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {kpi.trend}
              <span className="text-slate-500 ml-2 font-normal">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <RevenueChart data={stats?.revenueChart || []} />
        </div>

        {/* System Status Mini */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Quick Actions & Status</h3>
          
          <div className="space-y-4">
            <HealthIndicator 
              status="Operational" 
              label="All Systems Operational" 
              subLabel="Uptime: 99.99% this month" 
              icon={Activity}
            />

            <HealthIndicator 
              status="Degraded" 
              label={`${stats?.supportTicketsPending || 0} Support Tickets`} 
              subLabel="Requires attention" 
              icon={Clock}
            />

            <div className="mt-6 pt-6 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  + Add New Hospital
                </button>
                <button className="w-full text-left px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  Manage Subscription Plans
                </button>
                <button className="w-full text-left px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  View Full System Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
