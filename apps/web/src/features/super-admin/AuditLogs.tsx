import { useState } from 'react';
import { useGetAuditLogsQuery } from './superAdminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DataTable } from '../../components/common/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ShieldAlert, Search } from 'lucide-react';

export const AuditLogs = () => {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useGetAuditLogsQuery({ limit: 50, skip: (page - 1) * 50 });
  const [searchTerm, setSearchTerm] = useState('');

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-700">
          {row.original.action}
        </span>
      )
    },
    {
      accessorKey: 'actor',
      header: 'Performed By',
      cell: ({ row }) => {
        const value = row.original.actor;
        return value ? `${value.firstName} ${value.lastName} (${value.email})` : 'System';
      }
    },
    {
      accessorKey: 'tenantId',
      header: 'Target Tenant',
      cell: ({ row }) => {
        const value = row.original.tenantId;
        return value ? value.name : 'Global/System';
      }
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: ({ row }) => <span className="text-slate-400 font-mono text-xs">{row.original.ipAddress}</span>
    },
    {
      accessorKey: 'createdAt',
      header: 'Timestamp',
      cell: ({ row }) => <span className="text-slate-300 text-sm">{format(new Date(row.original.createdAt), 'MMM d, yyyy HH:mm:ss')}</span>
    }
  ];

  if (isLoading && page === 1) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" className="text-emerald-500" />
      </div>
    );
  }

  const logs = response?.data?.logs || [];
  
  const filteredLogs = logs.filter((log: any) => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.actor?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-emerald-500" />
          Global Audit Logs
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Comprehensive trail of all super admin and cross-tenant activities.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="relative w-96">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border-0 bg-slate-950 py-2 pl-10 pr-3 text-slate-300 ring-1 ring-inset ring-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all"
              placeholder="Search by action or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Total records: {response?.data?.total || 0}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-slate-700"
              >
                Previous
              </button>
              <button 
                disabled={page >= (response?.data?.totalPages || 1)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <DataTable 
          data={filteredLogs}
          columns={columns}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
