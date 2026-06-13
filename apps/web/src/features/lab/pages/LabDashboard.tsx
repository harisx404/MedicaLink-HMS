import React from 'react';
import { 
  TestTube,
  Clock,
  CheckCircle,
  AlertTriangle,
  Beaker,
  FileText
} from 'lucide-react';
import { useGetLabDashboardStatsQuery } from '../api/labApi';

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const StatsCard = ({ title, value, icon, color = 'indigo' }: any) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600'
  };
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${(colorClasses as any)[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export const LabDashboard: React.FC = () => {
  const { data: statsData, isLoading } = useGetLabDashboardStatsQuery();
  const stats = statsData?.data || { pendingCollection: 0, inProgress: 0, completedToday: 0, recentOrders: [] };
  const orders = stats.recentOrders;
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laboratory Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time overview of laboratory operations</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
            <TestTube size={18} className="mr-2" /> New Test Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Pending Collection" 
          value={isLoading ? "..." : stats.pendingCollection}
          icon={<AlertTriangle size={24} />} 
          color="amber"
        />
        <StatsCard 
          title="In Progress" 
          value={isLoading ? "..." : stats.inProgress}
          icon={<Beaker size={24} />} 
          color="indigo"
        />
        <StatsCard 
          title="Completed Today" 
          value={isLoading ? "..." : stats.completedToday}
          icon={<CheckCircle size={24} />} 
          color="emerald"
        />
        <StatsCard 
          title="Turnaround Breaches" 
          value="0"
          icon={<Clock size={24} />} 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Tests</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading orders...</td>
                  </tr>
                ) : orders.slice(0, 5).map((order: any) => (
                  <tr key={order._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-indigo-600">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{order.patient?.firstName} {order.patient?.lastName}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{order.tests?.length} tests</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!isLoading && orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No active orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center border border-transparent hover:border-slate-200">
                <div className="bg-amber-100 text-amber-600 p-2 rounded-lg mr-3">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Sample Collection</div>
                  <div className="text-xs text-slate-500">Print barcodes and collect samples</div>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center border border-transparent hover:border-slate-200">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
                  <Beaker size={18} />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Result Entry</div>
                  <div className="text-xs text-slate-500">Enter and review test parameters</div>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center border border-transparent hover:border-slate-200">
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg mr-3">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Verification</div>
                  <div className="text-xs text-slate-500">Pathologist review and approval</div>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center border border-transparent hover:border-slate-200">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Test Catalog</div>
                  <div className="text-xs text-slate-500">Manage tests and reference ranges</div>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
