import React, { useState } from 'react';
import { useGetVendorsQuery } from '../inventoryApi';
import { Building2, Search, Plus, Star, MapPin, Mail, Phone, Loader2 } from 'lucide-react';

export const VendorManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: vendorsData, isLoading } = useGetVendorsQuery();
  const vendors = vendorsData?.data || [];

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.category && v.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Vendor Management</h1>
          <p className="text-slate-400">Manage suppliers, contacts, and performance ratings.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none">
          <Plus className="mr-2 h-4 w-4" /> Add Vendor
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-12 text-center shadow-sm">
          <Building2 className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-medium text-white">No vendors found</h3>
          <p className="mt-2 text-sm text-slate-400">Add a new vendor to start managing your supply chain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div key={vendor._id} className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{vendor.name}</h3>
                  <span className="mt-1 inline-flex rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700">
                    {vendor.category || 'General Supplier'}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-bold">{vendor.rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>

              <div className="space-y-3 flex-1 mb-6">
                <div className="flex items-center text-sm text-slate-400">
                  <Mail className="h-4 w-4 mr-3 text-slate-500" />
                  {vendor.email || 'No email provided'}
                </div>
                <div className="flex items-center text-sm text-slate-400">
                  <Phone className="h-4 w-4 mr-3 text-slate-500" />
                  {vendor.phone || 'No phone provided'}
                </div>
                <div className="flex items-start text-sm text-slate-400">
                  <MapPin className="h-4 w-4 mr-3 text-slate-500 mt-0.5" />
                  <span className="flex-1">
                    {vendor.address?.city ? `${vendor.address.city}, ${vendor.address.country || ''}` : 'No address provided'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                  vendor.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${vendor.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                  {vendor.isActive ? 'Active' : 'Inactive'}
                </span>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
