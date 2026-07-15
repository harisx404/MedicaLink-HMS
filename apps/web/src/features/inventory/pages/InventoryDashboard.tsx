import React from 'react';
import { useGetStockValuationQuery, useGetLowStockItemsQuery } from '../inventoryApi';
import { Package, AlertCircle, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

export const InventoryDashboard: React.FC = () => {
  const { data: valuationData, isLoading: isLoadingValuation } = useGetStockValuationQuery();
  const { data: lowStockData, isLoading: isLoadingLowStock } = useGetLowStockItemsQuery();

  if (isLoadingValuation || isLoadingLowStock) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const valuation = valuationData?.data;
  const lowStock = lowStockData?.data || [];

  const chartData = valuation?.byCategory?.map(c => ({
    name: c._id,
    value: c.totalValue
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Inventory Dashboard</h1>
          <p className="text-slate-400">Overview of hospital assets and consumables.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Stock Value</p>
              <h3 className="mt-2 text-3xl font-bold text-white">
                ${valuation?.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </h3>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3 text-blue-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Low Stock Items</p>
              <h3 className="mt-2 text-3xl font-bold text-white">{lowStock.length}</h3>
            </div>
            <div className="rounded-full bg-amber-500/10 p-3 text-amber-400">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Categories</p>
              <h3 className="mt-2 text-3xl font-bold text-white">{valuation?.byCategory?.length || 0}</h3>
            </div>
            <div className="rounded-full bg-indigo-500/10 p-3 text-indigo-400">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Active Assets</p>
              <h3 className="mt-2 text-3xl font-bold text-white">--</h3>
            </div>
            <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Stock Valuation Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-6">Stock Value by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Low Stock Alerts</h3>
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500">
              {lowStock.length} items
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {lowStock.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Package className="h-12 w-12 text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">All items are sufficiently stocked.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lowStock.slice(0, 10).map((item) => (
                  <li key={item._id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/50 p-3">
                    <div>
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-slate-400">Code: {item.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">{item.currentStock} {item.unit}</p>
                      <p className="text-xs text-slate-400">Reorder: {item.reorderLevel}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {lowStock.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <Link to="/inventory/items" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                View all items &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
