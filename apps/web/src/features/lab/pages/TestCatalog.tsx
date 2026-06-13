import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2,
  FileText
} from 'lucide-react';
import { useListTestCatalogQuery } from '../api/labApi';

export const TestCatalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  
  const { data, isLoading } = useListTestCatalogQuery({ 
    search: searchTerm, 
    category: category || undefined 
  });
  
  const tests = data?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Catalog Management</h1>
          <p className="text-slate-500 mt-1">Manage laboratory tests, reference ranges, and parameters</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
            <Plus size={18} className="mr-2" /> Add New Test
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tests by code or name..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="HEMATOLOGY">Hematology</option>
          <option value="BIOCHEMISTRY">Biochemistry</option>
          <option value="MICROBIOLOGY">Microbiology</option>
          <option value="SEROLOGY">Serology</option>
          <option value="IMMUNOLOGY">Immunology</option>
          <option value="URINALYSIS">Urinalysis</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Test Code</th>
                <th className="px-6 py-4">Test Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Sample Type</th>
                <th className="px-6 py-4">TAT (Hours)</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading catalog...</td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                    <FileText size={32} className="text-slate-300 mb-3" />
                    <p>No tests found</p>
                  </td>
                </tr>
              ) : tests.map((test: any) => (
                <tr key={test._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-600">{test.code}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{test.name}</td>
                  <td className="px-6 py-4 text-slate-600">{test.category}</td>
                  <td className="px-6 py-4 text-slate-600">{test.sampleType}</td>
                  <td className="px-6 py-4 text-slate-600">{test.turnaroundTime}h</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">${test.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
