import React, { useState } from 'react';
import { useGetTransactionsQuery } from '../inventoryApi';
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, Settings2, Loader2, FileText, AlertCircle } from 'lucide-react';

export const StockMovement: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('');
  const { data: transactionsData, isLoading } = useGetTransactionsQuery(
    filterType ? { type: filterType } : undefined
  );

  const transactions = transactionsData?.data || [];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'RECEIPT':
      case 'RETURN':
        return <ArrowDownRight className="h-5 w-5 text-emerald-500" />;
      case 'ISSUE':
      case 'DAMAGE':
        return <ArrowUpRight className="h-5 w-5 text-rose-500" />;
      case 'TRANSFER':
        return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
      case 'ADJUSTMENT':
        return <Settings2 className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5 text-slate-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'RECEIPT':
      case 'RETURN':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'ISSUE':
      case 'DAMAGE':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'TRANSFER':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ADJUSTMENT':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Stock Movement</h1>
          <p className="text-slate-400">Track and manage inventory issues, receipts, and transfers.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-rose-700 focus:outline-none">
            Issue Stock
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 focus:outline-none">
            Receive Stock
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        <button 
          onClick={() => setFilterType('')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === '' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilterType('RECEIPT')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'RECEIPT' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          Receipts
        </button>
        <button 
          onClick={() => setFilterType('ISSUE')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'ISSUE' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          Issues
        </button>
        <button 
          onClick={() => setFilterType('TRANSFER')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'TRANSFER' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          Transfers
        </button>
        <button 
          onClick={() => setFilterType('ADJUSTMENT')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'ADJUSTMENT' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          Adjustments
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-4 text-lg font-medium text-white">No transactions found</h3>
            <p className="mt-2 text-sm text-slate-400">There are no stock movements matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Date</th>
                  <th scope="col" className="px-6 py-4 font-medium">Type</th>
                  <th scope="col" className="px-6 py-4 font-medium">Item</th>
                  <th scope="col" className="px-6 py-4 font-medium">Qty</th>
                  <th scope="col" className="px-6 py-4 font-medium">Department</th>
                  <th scope="col" className="px-6 py-4 font-medium">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(tx.transactionType)}
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${getTransactionColor(tx.transactionType)}`}>
                          {tx.transactionType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {typeof tx.item === 'object' ? (tx.item as any).name : 'Unknown Item'}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {tx.quantity}
                    </td>
                    <td className="px-6 py-4">
                      {tx.transactionType === 'ISSUE' && typeof tx.toDepartment === 'object' 
                        ? (tx.toDepartment as any)?.name || '-'
                        : tx.transactionType === 'RECEIPT' && typeof tx.fromDepartment === 'object'
                        ? (tx.fromDepartment as any)?.name || '-'
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {typeof tx.performedBy === 'object' ? `${(tx.performedBy as any).firstName} ${(tx.performedBy as any).lastName}` : 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
