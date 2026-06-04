import { useState } from 'react';
import { useGetTenantsQuery, useDeactivateTenantMutation } from './superAdminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DataTable } from '../../components/common/DataTable';
import { TenantCard } from '../../components/super-admin/TenantCard';
import type { ColumnDef } from '@tanstack/react-table';
import { Building2, Search, Plus, Power, Eye, LayoutGrid, List } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const HospitalList = () => {
  const { data: response, isLoading } = useGetTenantsQuery({});
  const [deactivateTenant] = useDeactivateTenantMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const navigate = useNavigate();

  const handleDeactivate = async (id: string, currentStatus: string) => {
    if (currentStatus === 'INACTIVE') {
      toast.error('Hospital is already inactive.');
      return;
    }
    
    if (window.confirm('Are you sure you want to deactivate this hospital? All its users will lose access immediately.')) {
      try {
        await deactivateTenant(id).unwrap();
        toast.success('Hospital deactivated successfully');
      } catch (err) {
        toast.error('Failed to deactivate hospital');
      }
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Hospital Name',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            {row.original.logoUrl ? (
              <img src={row.original.logoUrl} alt="" className="h-8 w-8 rounded-md" />
            ) : (
              <Building2 className="h-5 w-5 text-emerald-500" />
            )}
          </div>
          <div className="ml-4">
            <div className="font-medium text-slate-200">{row.original.name}</div>
            <div className="text-slate-500 text-xs mt-0.5">{row.original.slug}.medicalink.com</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'plan',
      header: 'Plan',
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-700">
          {row.original.plan || 'Trial'}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.status === 'ACTIVE';
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
            isActive 
              ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 ring-rose-500/20'
          }`}>
            {row.original.status}
          </span>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Onboarded',
      cell: ({ row }) => <span className="text-slate-400 text-sm">{format(new Date(row.original.createdAt), 'MMM d, yyyy')}</span>
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => navigate(`/super-admin/hospitals/${row.original._id}`)}
            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDeactivate(row.original._id, row.original.status)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
            title="Deactivate"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" className="text-emerald-500" />
      </div>
    );
  }

  const tenants = response?.data || [];
  const filteredTenants = tenants.filter((t: any) => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hospitals</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage all tenant hospitals on the MedicaLink platform.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to="/super-admin/hospitals/new"
            className="flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Onboard Hospital
          </Link>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="relative w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border-0 bg-slate-950 py-2 pl-10 pr-3 text-slate-300 ring-1 ring-inset ring-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all"
              placeholder="Search hospitals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <select className="block w-full rounded-xl border-0 bg-slate-950 py-2 pl-3 pr-10 text-slate-300 ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all">
              <option value="">All Plans</option>
              <option value="BASIC">Basic</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((t: any) => (
              <TenantCard 
                key={t._id}
                id={t._id}
                name={t.name}
                slug={t.slug}
                plan={t.plan || 'Trial'}
                status={t.status}
              />
            ))}
            {filteredTenants.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No hospitals found matching your search.
              </div>
            )}
          </div>
        ) : (
          <DataTable 
            data={filteredTenants}
            columns={columns}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};
