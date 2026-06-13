import React, { useState } from 'react';
import { 
  Settings, 
  Search, 
  Plus, 
  FileSpreadsheet
} from 'lucide-react';
import { 
  useListServiceChargesQuery, 
  useCreateServiceChargeMutation 
} from '../api/billingApi';
import { BillItemCategory } from '@medicalink/shared';

export const ServiceChargeMaster: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data, isLoading, refetch } = useListServiceChargesQuery({ category: categoryFilter, search });
  const [createService, { isLoading: isCreating }] = useCreateServiceChargeMutation();

  const services = data?.data || [];

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as BillItemCategory,
      price: Number(formData.get('price')),
      taxRate: Number(formData.get('taxRate')),
    };

    try {
      await createService(payload).unwrap();
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Settings className="mr-3 text-indigo-600" size={28} /> 
            Service Charge Master
          </h1>
          <p className="text-slate-500 mt-1">Manage price lists, services, and tax rates</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 font-medium flex items-center transition-colors">
            <FileSpreadsheet size={18} className="mr-2" /> Import Excel
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
          >
            <Plus size={18} className="mr-2" /> Add Service
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by code or name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
          >
            <option value="">All Categories</option>
            {Object.values(BillItemCategory).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Price (₹)</th>
                <th className="px-6 py-4 text-right">GST %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No services found</td></tr>
              ) : (
                services.map((service) => (
                  <tr key={service._id} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{service.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{service.name}</td>
                    <td className="px-6 py-4 text-slate-500">{service.category}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{service.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{service.taxRate}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Add Service Charge</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Code</label>
                <input name="code" type="text" required className="w-full rounded-lg border-slate-300 uppercase" placeholder="e.g. CON-OPD-01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name / Description</label>
                <input name="name" type="text" required className="w-full rounded-lg border-slate-300" placeholder="e.g. Initial Consultation" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select name="category" required className="w-full rounded-lg border-slate-300">
                  {Object.values(BillItemCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Base Price (₹)</label>
                  <input name="price" type="number" min="0" required className="w-full rounded-lg border-slate-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (GST)</label>
                  <select name="taxRate" required className="w-full rounded-lg border-slate-300">
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={isCreating} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
