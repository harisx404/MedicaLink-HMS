import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Download, 
  IndianRupee 
} from 'lucide-react';
import { useListBillsQuery } from '../api/billingApi';
import { BillStatus } from '@medicalink/shared';

export const BillList: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Pagination would be added here in a full implementation
  const { data, isLoading } = useListBillsQuery({ status: statusFilter, limit: 50 });
  const bills = data?.data || [];

  const filteredBills = bills.filter(bill => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      bill.billNumber.toLowerCase().includes(s) ||
      bill.patient?.firstName?.toLowerCase().includes(s) ||
      bill.patient?.lastName?.toLowerCase().includes(s) ||
      bill.patient?.uhid?.toLowerCase().includes(s)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case BillStatus.PAID: return 'bg-emerald-100 text-emerald-700';
      case BillStatus.PARTIAL: return 'bg-amber-100 text-amber-700';
      case BillStatus.GENERATED: return 'bg-blue-100 text-blue-700';
      case BillStatus.DRAFT: return 'bg-slate-100 text-slate-700';
      case BillStatus.VOID: return 'bg-red-100 text-red-700';
      case BillStatus.REFUNDED: return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bills Register</h1>
          <p className="text-slate-500 mt-1">Manage and track all patient bills</p>
        </div>
        <button 
          onClick={() => navigate('/billing/new')}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Create New Bill
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by bill number, patient name, or UHID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-700 appearance-none bg-white"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="GENERATED">Generated (Unpaid)</option>
                <option value="PARTIAL">Partially Paid</option>
                <option value="PAID">Fully Paid</option>
                <option value="VOID">Void</option>
              </select>
            </div>
            <button className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium flex items-center">
              <Download size={16} className="mr-2" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Bill Details</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Net Amount</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-8 w-8 bg-slate-200 rounded-full mb-3"></div>
                      <div className="h-4 bg-slate-200 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-32"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <FileText size={40} className="text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-700">No bills found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search term</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-indigo-600">{bill.billNumber}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(bill.billDate).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {bill.patient?.firstName} {bill.patient?.lastName}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{bill.patient?.uhid}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                        {bill.billType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-slate-900">
                        ₹{bill.netAmount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {bill.balance > 0 ? (
                        <div className="font-bold text-rose-600">
                          ₹{bill.balance.toLocaleString('en-IN')}
                        </div>
                      ) : (
                        <div className="text-slate-400 font-medium">₹0</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/billing/bills/${bill._id}`)}
                          className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"
                          title="View Bill"
                        >
                          <Eye size={16} />
                        </button>
                        {bill.balance > 0 && bill.status !== BillStatus.DRAFT && bill.status !== BillStatus.VOID && (
                          <button 
                            onClick={() => navigate(`/billing/bills/${bill._id}?action=pay`)}
                            className="p-1.5 text-emerald-600 bg-white border border-slate-200 rounded hover:bg-emerald-50 hover:border-emerald-200 shadow-sm transition-all"
                            title="Collect Payment"
                          >
                            <IndianRupee size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
