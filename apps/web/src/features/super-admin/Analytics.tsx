import { useGetAnalyticsQuery } from './superAdminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { RevenueChart } from '../../components/super-admin/RevenueChart';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

export const Analytics = () => {
  const { data: response, isLoading } = useGetAnalyticsQuery({});

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" className="text-emerald-500" />
      </div>
    );
  }

  const analytics = response?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">
          In-depth revenue and usage metrics across all tenants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">ARR (Annual Recurring Revenue)</p>
          <p className="mt-2 text-3xl font-bold text-white">{analytics?.metrics?.arr || '$0'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Churn Rate</p>
          <p className="mt-2 text-3xl font-bold text-white">{analytics?.metrics?.churnRate || '0%'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Customer LTV</p>
          <p className="mt-2 text-3xl font-bold text-white">{analytics?.metrics?.ltv || '$0'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">ARPU</p>
          <p className="mt-2 text-3xl font-bold text-white">{analytics?.metrics?.arpu || '$0'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart 
          data={(analytics?.mrrData || []).map((d: any) => ({ name: d.date, revenue: d.mrr }))} 
          title="MRR Analytics" 
          subtitle="Daily MRR for the last 30 days" 
        />
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-6">Daily Active Users (30 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dauData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v.replace('Day ', '')} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="activeUsers" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDau)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm col-span-1 lg:col-span-2 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-6">Geographic Distribution</h3>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.geographicDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="country"
                  >
                    {(analytics?.geographicDistribution || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={3} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <h4 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Top Regions by Tenant Count</h4>
            <ul className="space-y-3">
              {(analytics?.geographicDistribution || []).map((item: any, index: number) => {
                const total = (analytics?.geographicDistribution || []).reduce((acc: number, curr: any) => acc + curr.count, 0);
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                
                return (
                  <li key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm font-medium text-slate-200">{item.country}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-24 bg-slate-800 rounded-full h-1.5 hidden sm:block">
                        <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                      </div>
                      <span className="text-sm font-bold text-white w-8 text-right">{item.count}</span>
                      <span className="text-xs text-slate-500 w-8 text-right">{percentage}%</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
