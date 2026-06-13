import React from 'react';
import { 
  Receipt, 
  IndianRupee, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetDailyCollectionQuery, 
  useGetRevenueAnalyticsQuery,
  useListBillsQuery
} from '../api/billingApi';
import { RevenueLineChart } from '../components/RevenueLineChart';
import { PaymentModePieChart } from '../components/PaymentModePieChart';
import { BillStatus } from '@medicalink/shared';

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const StatsCard = ({ title, value, icon, color = 'indigo', trend, trendUp }: any) => {
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
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          
          {trend && (
            <div className={`flex items-center mt-2 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {trend} vs last month
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${(colorClasses as any)[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export const BillingDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: dailyData, isLoading: isLoadingDaily } = useGetDailyCollectionQuery({});
  const { data: revenueData, isLoading: isLoadingRevenue } = useGetRevenueAnalyticsQuery();
  const { data: recentBillsData } = useListBillsQuery({ limit: 5 });

  const dailyCollection = dailyData?.data?.totalCollection || 0;
  const paymentModes = dailyData?.data?.byMode || [];
  
  const totalRevenue = revenueData?.data?.totalRevenue || 0;
  const trendData = revenueData?.data?.trend || [];
  
  const recentBills = recentBillsData?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Finance Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time revenue and collection overview</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/billing/insurance')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Insurance Claims
          </button>
          <button 
            onClick={() => navigate('/billing/new')}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm"
          >
            <Receipt size={18} className="mr-2" /> Create New Bill
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Today's Collection" 
          value={isLoadingDaily ? '...' : `₹${dailyCollection.toLocaleString('en-IN')}`}
          icon={<IndianRupee size={24} />} 
          color="emerald"
        />
        <StatsCard 
          title="30-Day Revenue" 
          value={isLoadingRevenue ? '...' : `₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={<Receipt size={24} />} 
          color="indigo"
          trend="12.5%"
          trendUp={true}
        />
        <StatsCard 
          title="Pending Bills" 
          value="45"
          icon={<Clock size={24} />} 
          color="amber"
        />
        <StatsCard 
          title="Unsubmitted Claims" 
          value="12"
          icon={<AlertCircle size={24} />} 
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Revenue Trend (30 Days)</h2>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer font-medium text-slate-700">
              <option>Last 30 Days</option>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          {isLoadingRevenue ? (
            <div className="h-[300px] flex items-center justify-center text-slate-400">Loading chart...</div>
          ) : (
            <RevenueLineChart data={trendData} />
          )}
        </Card>

        <Card className="p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Today's Collection Split</h2>
          <p className="text-sm text-slate-500 mb-6">By payment mode</p>
          
          <div className="flex-1 flex flex-col justify-center">
            {isLoadingDaily ? (
              <div className="h-[250px] flex items-center justify-center text-slate-400">Loading chart...</div>
            ) : (
              <PaymentModePieChart data={paymentModes} height={250} />
            )}
          </div>
        </Card>
      </div>

      {/* Recent Bills Table */}
      <Card>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Recent Bills</h2>
          <button 
            onClick={() => navigate('/billing/bills')}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
          >
            View All Bills
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4">Bill Number</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <FileText size={32} className="text-slate-300 mb-3" />
                      <p>No recent bills found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentBills.map((bill) => (
                  <tr 
                    key={bill._id} 
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/billing/bills/${bill._id}`)}
                  >
                    <td className="px-6 py-4 font-bold text-indigo-600">{bill.billNumber}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(bill.billDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {bill.patient?.firstName} {bill.patient?.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{bill.patient?.uhid}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      ₹{bill.netAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        bill.status === BillStatus.PAID ? 'bg-emerald-100 text-emerald-700' :
                        bill.status === BillStatus.PARTIAL ? 'bg-amber-100 text-amber-700' :
                        bill.status === BillStatus.DRAFT ? 'bg-slate-100 text-slate-700' :
                        bill.status === BillStatus.VOID ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
