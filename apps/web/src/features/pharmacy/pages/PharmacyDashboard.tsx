import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle,
  Clock,
  PackageX,
  Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { useGetPharmacyDashboardQuery, useGetPrescriptionQueueQuery } from '../api/pharmacyApi';

// Mock components - would import from ui library in reality
const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const StatsCard = ({ title, value, icon, trend, alert = false }: any) => (
  <Card className="p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className={`text-3xl font-bold ${alert ? 'text-red-600' : 'text-slate-900'}`}>{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${alert ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <span className="text-emerald-600 font-medium">{trend}</span>
        <span className="text-slate-500 ml-2">vs last week</span>
      </div>
    )}
  </Card>
);

export const PharmacyDashboard: React.FC = () => {
  const { data: statsData, isLoading: statsLoading } = useGetPharmacyDashboardQuery();
  const { data: queueData, isLoading: queueLoading } = useGetPrescriptionQueueQuery();

  const stats = statsData?.data || {
    pendingPrescriptions: 0,
    todaysDispensed: 0,
    lowStockItems: 0,
    expiringThisMonth: 0
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pharmacy Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time overview of pharmacy operations</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Pending Prescriptions" 
          value={statsLoading ? "..." : stats.pendingPrescriptions}
          icon={<Clock size={24} />} 
        />
        <StatsCard 
          title="Today's Dispensed" 
          value={statsLoading ? "..." : stats.todaysDispensed}
          icon={<CheckCircle size={24} />} 
          trend="+12%"
        />
        <StatsCard 
          title="Low Stock Items" 
          value={statsLoading ? "..." : stats.lowStockItems}
          icon={<PackageX size={24} />} 
          alert={stats.lowStockItems > 0}
        />
        <StatsCard 
          title="Expiring This Month" 
          value={statsLoading ? "..." : stats.expiringThisMonth}
          icon={<AlertTriangle size={24} />} 
          alert={stats.expiringThisMonth > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Dispensing Trend (7 Days)</h2>
          </div>
          <div className="p-6 h-80">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center text-slate-500">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dispensingTrend || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line yAxisId="left" type="monotone" name="Prescriptions" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  <Line yAxisId="right" type="monotone" name="Revenue ($)" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Top 10 Dispensed Drugs</h2>
          </div>
          <div className="p-6 h-80">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center text-slate-500">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topDispensedDrugs || []} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#475569'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Bar dataKey="totalQuantity" name="Quantity Dispensed" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription Queue */}
        <Card className="lg:col-span-2">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Live Prescription Queue</h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              {queueData?.data?.length || 0} Waiting
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading queue...</td>
                  </tr>
                ) : queueData?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No pending prescriptions</td>
                  </tr>
                ) : (
                  queueData?.data?.slice(0, 5).map((rx: any) => (
                    <tr key={rx._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{rx.patient?.firstName} {rx.patient?.lastName}</div>
                        <div className="text-xs text-slate-500">{rx.patient?.uhid}</div>
                      </td>
                      <td className="px-6 py-4">Dr. {rx.doctor?.lastName}</td>
                      <td className="px-6 py-4">{rx.medications?.length || 0} drugs</td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium">
                          Process
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Alerts & Action Items */}
        <div className="space-y-6">
          <Card>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">Inventory Alerts</h2>
              <span className="flex items-center text-xs font-medium text-slate-500">
                <Activity size={14} className="mr-1 text-indigo-500" /> Live Data
              </span>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {statsLoading ? (
                 <div className="py-4 text-center text-slate-500 text-sm">Loading alerts...</div>
              ) : (
                <>
                  {(!stats.expiringAlerts?.length && !stats.lowStockAlerts?.length) && (
                    <div className="py-8 text-center text-slate-500 flex flex-col items-center">
                      <CheckCircle size={32} className="text-emerald-300 mb-2" />
                      <p className="text-sm">No critical inventory alerts</p>
                    </div>
                  )}
                  
                  {stats.expiringAlerts?.map((alert: any, idx: number) => {
                    const isExpired = new Date(alert.expiryDate) < new Date();
                    return (
                      <div key={`exp-${idx}`} className={`p-4 ${isExpired ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'} border rounded-lg flex items-start`}>
                        <AlertTriangle className={`${isExpired ? 'text-red-500' : 'text-orange-500'} mt-0.5 mr-3 shrink-0`} size={18} />
                        <div>
                          <h4 className={`text-sm font-semibold ${isExpired ? 'text-red-800' : 'text-orange-800'}`}>
                            {isExpired ? 'Expired Drug Detected' : 'Expiring Soon'}
                          </h4>
                          <p className={`text-xs ${isExpired ? 'text-red-600' : 'text-orange-700'} mt-1`}>
                            <span className="font-medium">{alert.drug?.name}</span> (Batch: {alert.batchNumber})
                            <br />
                            Qty: {alert.remainingQuantity} | {isExpired ? 'Expired on' : 'Expires on'}: {new Date(alert.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {stats.lowStockAlerts?.map((alert: any, idx: number) => (
                    <div key={`low-${idx}`} className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start">
                      <PackageX className="text-amber-500 mt-0.5 mr-3 shrink-0" size={18} />
                      <div>
                        <h4 className="text-sm font-semibold text-amber-800">Low Stock Alert</h4>
                        <p className="text-xs text-amber-700 mt-1">
                          <span className="font-medium">{alert.name}</span>
                          <br />
                          Current: <span className="font-bold text-amber-800">{alert.currentStock}</span> | Min: {alert.reorderLevel}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
