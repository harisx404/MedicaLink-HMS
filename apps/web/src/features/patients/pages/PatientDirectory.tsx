import React, { useState } from 'react';
import { useGetPatientsQuery } from '../api/patientApi';
import { PatientCard } from '../components/PatientCard';
import { useDebounce } from '../../../hooks/useDebounce';
import { Search, Plus, Filter, Users, LayoutGrid, List as ListIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import type { SharedPatient } from '@medicalink/shared';

export const PatientDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterActive, setFilterActive] = useState<boolean>(true);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching } = useGetPatientsQuery({
    q: debouncedSearch,
    limit: 20,
    page: 1,
    // Add other filters like registrationType if needed later
  });

  const patients = data?.data || [];
  const pagination = data?.pagination;

  return (
    <PageWrapper title="Patient Directory">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Directory</h1>
            <p className="text-sm text-gray-500">Manage and search hospital patient records</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/patients/register')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm shadow-blue-200 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Register Patient
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, UHID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
            />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={18} />
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setFilterActive(!filterActive)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors flex-1 sm:flex-none justify-center ${filterActive ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <Filter size={18} />
              Filters
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel (Collapsible) */}
        {filterActive && (
          <div className="p-4 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500">
              <option value="">All Registration Types</option>
              <option value="OPD">Outpatient (OPD)</option>
              <option value="IPD">Inpatient (IPD)</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500">
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button className="px-4 py-2 text-blue-600 text-sm font-medium hover:underline text-left sm:text-right">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
          <p className="text-gray-500">Loading patients database...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No patients found</h3>
          <p className="text-gray-500 text-center max-w-sm mb-6">
            We couldn't find any patients matching your current search or filter criteria.
          </p>
          <button 
            onClick={() => { setSearchTerm(''); setFilterActive(false); }}
            className="text-blue-600 font-medium hover:underline"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "flex flex-col gap-4"
          }>
            {patients.map((patient: SharedPatient) => (
              <PatientCard 
                key={patient.id} 
                patient={patient} 
                onClick={(p) => navigate(`/patients/${p.id}`)}
                className={viewMode === 'list' ? "md:col-span-full" : ""}
              />
            ))}
          </div>
          
          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-gray-900">{pagination.total}</span> patients
              </p>
              <div className="flex gap-2">
                <button disabled={pagination.page === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50">Previous</button>
                <button disabled={pagination.page === pagination.pages} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};
