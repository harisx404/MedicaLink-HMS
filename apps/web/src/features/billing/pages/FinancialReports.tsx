import React, { useState } from 'react';
import { 
  BarChart, 
  TrendingUp, 
  Download,
  IndianRupee,
  Clock,
  Shield,
  Printer
} from 'lucide-react';
import { 
  useGetDailyCollectionQuery,
  useGetRevenueAnalyticsQuery,
  useGetOutstandingReportQuery,
  useGetInsuranceReportQuery
} from '../api/billingApi';
import { RevenueLineChart } from '../components/RevenueLineChart';
import { PaymentModePieChart } from '../components/PaymentModePieChart';

export const FinancialReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DAILY' | 'REVENUE' | 'OUTSTANDING' | 'INSURANCE'>('REVENUE');

  const { data: dailyData, isLoading: isDailyLoading } = useGetDailyCollectionQuery({});
  const { data: revenueData, isLoading: isRevenueLoading } = useGetRevenueAnalyticsQuery();
  const { data: outstandingData, isLoading: isOutstandingLoading } = useGetOutstandingReportQuery();
  const { data: insuranceData, isLoading: isInsuranceLoading } = useGetInsuranceReportQuery();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <BarChart className="mr-3 text-indigo-600" size={28} /> 
            Financial Reports & Analytics
          </h1>
          <p className="text-slate-500 mt-1">CFO-level insights and revenue tracking</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center transition-colors">
            <Printer size={16} className="mr-2" /> Print Report
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center transition-colors shadow-sm">
            <Download size={16} className="mr-2" /> Export to Excel
          </button>
        </div>
      </div>

      {/* Tabs - Hidden in print */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200 print:hidden overflow-x-auto">
        {[
          { id: 'REVENUE', label: 'Revenue Analytics', icon: TrendingUp },
          { id: 'DAILY', label: 'Daily Collection', icon: IndianRupee },
          { id: 'OUTSTANDING', label: 'Outstanding Balance', icon: Clock },
          { id: 'INSURANCE', label: 'Insurance Summary', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <tab.icon size={16} className="mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      {/* --- REVENUE TAB --- */}
      {activeTab === 'REVENUE' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">30-Day Revenue Trend</h3>
              {isRevenueLoading ? (
                <div className="h-[350px] bg-slate-50 rounded-lg animate-pulse"></div>
              ) : (
                <RevenueLineChart data={revenueData?.data?.trend || []} height={350} />
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Revenue by Department</h3>
              <p className="text-sm text-slate-500 mb-6">Last 30 days breakdown</p>
              
              {isRevenueLoading ? (
                <div className="flex-1 bg-slate-50 rounded-lg animate-pulse"></div>
              ) : (
                <div className="flex-1 space-y-4">
                  {(revenueData?.data?.byCategory || []).map((cat: any) => (
                    <div key={cat.department}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{cat.department}</span>
                        <span className="font-bold text-slate-900">₹{cat.revenue.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full" 
                          style={{ width: `${Math.max(5, (cat.revenue / (revenueData?.data?.totalRevenue || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- OUTSTANDING TAB --- */}
      {activeTab === 'OUTSTANDING' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right-4 duration-300">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-900">Ageing Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Patient / UHID</th>
                  <th className="px-6 py-4">Bill No & Date</th>
                  <th className="px-6 py-4 text-right">Bill Amount</th>
                  <th className="px-6 py-4 text-right">Balance Due</th>
                  <th className="px-6 py-4 text-center">Ageing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isOutstandingLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : (outstandingData?.data || []).length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No outstanding balances.</td></tr>
                ) : (
                  (outstandingData?.data || []).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{row.patient}</div>
                        <div className="text-xs text-slate-500">{row.uhid}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{row.billNumber}</div>
                        <div className="text-xs text-slate-500">{new Date(row.billDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">
                        ₹{row.netAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-rose-600">
                        ₹{row.balance.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          row.agingBucket === '90+' ? 'bg-red-100 text-red-700' :
                          row.agingBucket === '61-90' ? 'bg-orange-100 text-orange-700' :
                          row.agingBucket === '31-60' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {row.agingBucket} days
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- DAILY COLLECTION --- */}
      {activeTab === 'DAILY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <p className="text-slate-500 font-medium mb-2">Total Collection Today</p>
              {isDailyLoading ? (
                <div className="h-10 bg-slate-100 rounded w-1/2 mx-auto animate-pulse"></div>
              ) : (
                <h2 className="text-4xl font-black text-emerald-600">
                  ₹{dailyData?.data?.totalCollection?.toLocaleString('en-IN') || 0}
                </h2>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">By Payment Mode</h3>
              {isDailyLoading ? (
                <div className="h-48 bg-slate-50 rounded animate-pulse"></div>
              ) : (
                <PaymentModePieChart data={dailyData?.data?.byMode || []} height={250} />
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900">Today's Receipts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Bill No</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4 text-right">Bill Amt</th>
                    <th className="px-6 py-4 text-right">Paid Today</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(dailyData?.data?.bills || []).map((bill: any, i: number) => (
                    <tr key={i}>
                      <td className="px-6 py-4 font-medium text-indigo-600">{bill.billNumber}</td>
                      <td className="px-6 py-4 text-slate-900">{bill.patient}</td>
                      <td className="px-6 py-4 text-right">₹{bill.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{bill.paidAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {(dailyData?.data?.bills || []).length === 0 && !isDailyLoading && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No collections today</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- INSURANCE SUMMARY --- */}
      {activeTab === 'INSURANCE' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-slate-500 font-medium mb-1 text-sm">Total Claimed</p>
              <h3 className="text-3xl font-black text-slate-900">
                ₹{isInsuranceLoading ? '...' : (insuranceData?.data?.totalClaimed || 0).toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-slate-500 font-medium mb-1 text-sm">Total Approved</p>
              <h3 className="text-3xl font-black text-indigo-600">
                ₹{isInsuranceLoading ? '...' : (insuranceData?.data?.totalApproved || 0).toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-slate-500 font-medium mb-1 text-sm">Total Settled (Realized)</p>
              <h3 className="text-3xl font-black text-emerald-600">
                ₹{isInsuranceLoading ? '...' : (insuranceData?.data?.totalSettled || 0).toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
