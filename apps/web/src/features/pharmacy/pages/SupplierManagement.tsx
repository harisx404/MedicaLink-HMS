import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Building2,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Activity
} from 'lucide-react';
import { useListSuppliersQuery } from '../api/pharmacyApi';

export const SupplierManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useListSuppliersQuery();
  
  const suppliers = data?.data || [];
  
  const filteredSuppliers = suppliers.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supplier Management</h1>
          <p className="text-slate-500 mt-1">Manage pharmaceutical distributors and vendors</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm shadow-indigo-200">
          <Plus size={18} className="mr-2" /> Add Supplier
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search suppliers by name or contact person..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-500">Loading suppliers...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 flex flex-col items-center">
            <Building2 size={48} className="text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-900">No suppliers found</p>
            <p>Try a different search term or add a new supplier.</p>
          </div>
        ) : (
          filteredSuppliers.map((supplier: any) => (
            <div key={supplier._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-4">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{supplier.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className={`w-2 h-2 rounded-full mr-2 ${supplier.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        {supplier.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start text-sm">
                  <Mail size={16} className="text-slate-400 mr-3 mt-0.5 shrink-0" />
                  <span className="text-slate-600 font-medium">{supplier.email || 'No email provided'}</span>
                </div>
                <div className="flex items-start text-sm">
                  <Phone size={16} className="text-slate-400 mr-3 mt-0.5 shrink-0" />
                  <span className="text-slate-600 font-medium">{supplier.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-start text-sm">
                  <MapPin size={16} className="text-slate-400 mr-3 mt-0.5 shrink-0" />
                  <span className="text-slate-600">{supplier.address || 'No address provided'}</span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-sm">
                <div className="flex items-center text-slate-500">
                  <Activity size={16} className="mr-2" />
                  <span>GST: {supplier.gstNumber || 'N/A'}</span>
                </div>
                <button className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                  View Orders
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
