import React, { useState } from 'react';
import { useGetInventoryItemsQuery } from '../inventoryApi';
import { Plus, Search, Filter, Loader2, PackageOpen, AlertTriangle } from 'lucide-react';

export const StockList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: itemsData, isLoading } = useGetInventoryItemsQuery();

  const items = itemsData?.data || [];
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Stock List</h1>
          <p className="text-slate-400">Manage all consumable and non-consumable inventory items.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700 focus:outline-none">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <PackageOpen className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-4 text-lg font-medium text-white">No items found</h3>
            <p className="mt-2 text-sm text-slate-400">Get started by creating a new inventory item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Code & Name</th>
                  <th scope="col" className="px-6 py-4 font-medium">Category</th>
                  <th scope="col" className="px-6 py-4 font-medium">Stock</th>
                  <th scope="col" className="px-6 py-4 font-medium">Unit Cost</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.currentStock <= item.reorderLevel && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${item.currentStock <= item.reorderLevel ? 'text-amber-500' : 'text-white'}`}>
                          {item.currentStock}
                        </span>
                        <span className="text-xs text-slate-500">{item.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      ${item.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 font-medium text-sm">Edit</button>
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
