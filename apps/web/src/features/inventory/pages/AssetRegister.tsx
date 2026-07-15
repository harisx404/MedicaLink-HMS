import React from 'react';
import { useGetAssetsQuery } from '../inventoryApi';
import { Monitor, HeartPulse, Wrench, AlertTriangle, Loader2 } from 'lucide-react';

export const AssetRegister: React.FC = () => {
  const { data: assetsData, isLoading } = useGetAssetsQuery();
  const assets = assetsData?.data || [];

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'GOOD':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'FAIR':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'POOR':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'OUT_OF_SERVICE':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500';
      case 'IN_MAINTENANCE':
        return 'bg-amber-500';
      case 'CONDEMNED':
      case 'DISPOSED':
        return 'bg-rose-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Asset Register</h1>
          <p className="text-slate-400">Track and maintain high-value hospital equipment and assets.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none">
          Add New Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Total Assets</p>
            <p className="mt-2 text-2xl font-bold text-white">{assets.length}</p>
          </div>
          <Monitor className="h-8 w-8 text-blue-500 opacity-50" />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">In Maintenance</p>
            <p className="mt-2 text-2xl font-bold text-amber-500">
              {assets.filter(a => a.status === 'IN_MAINTENANCE').length}
            </p>
          </div>
          <Wrench className="h-8 w-8 text-amber-500 opacity-50" />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Requires Attention</p>
            <p className="mt-2 text-2xl font-bold text-rose-500">
              {assets.filter(a => a.condition === 'POOR' || a.condition === 'OUT_OF_SERVICE').length}
            </p>
          </div>
          <AlertTriangle className="h-8 w-8 text-rose-500 opacity-50" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <HeartPulse className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-4 text-lg font-medium text-white">No assets found</h3>
            <p className="mt-2 text-sm text-slate-400">Register your first hospital asset to begin tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Asset ID</th>
                  <th scope="col" className="px-6 py-4 font-medium">Name & Category</th>
                  <th scope="col" className="px-6 py-4 font-medium">Location</th>
                  <th scope="col" className="px-6 py-4 font-medium">Condition</th>
                  <th scope="col" className="px-6 py-4 font-medium">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {assets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {asset.assetNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">
                        {typeof asset.item === 'object' ? (asset.item as any).name : 'Unknown Item'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {typeof asset.item === 'object' ? (asset.item as any).category : 'Unknown'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {asset.location ? (
                        <div className="text-sm">
                          <span className="block text-white">{asset.location.building}</span>
                          <span className="block text-xs text-slate-500">
                            {asset.location.floor && `Fl: ${asset.location.floor}`} 
                            {asset.location.room && `, Rm: ${asset.location.room}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${getConditionColor(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(asset.status)}`}></span>
                        <span className="text-xs font-medium text-slate-300">{asset.status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 font-medium text-sm">View Details</button>
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
