import React, { useState } from 'react';
import { useGetDoctorsQuery } from '../api/doctorApi';
import { DoctorCard } from '../components/DoctorCard';
import { Search, Plus, LayoutGrid, List as ListIcon, User } from 'lucide-react';
import { Button, Input } from '../../../components/ui';
import { Link } from 'react-router-dom';

export const DoctorDirectory: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');

  const { data, isLoading, isError } = useGetDoctorsQuery({
    specialty: specialtyFilter || undefined,
  });

  const doctors = data?.data || [];

  const filteredDoctors = doctors.filter((doctor) => {
    const fullName = `${doctor.user?.firstName} ${doctor.user?.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Directory</h1>
          <p className="text-slate-500">Manage and view all hospital doctors</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to="/doctors/new">
            <Button variant="primary" className="gap-2 w-full sm:w-auto">
              <Plus size={18} />
              Add Doctor
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex-1 flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search doctors by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative w-48">
            <select
              value={specialtyFilter}
              onChange={(e: any) => setSpecialtyFilter(e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Oncology">Oncology</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ListIcon size={18} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white h-64 rounded-2xl border border-slate-200"></div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-red-500 p-6 rounded-xl text-center border border-red-100">
          Failed to load doctors. Please try again later.
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-slate-50 text-slate-500 p-12 rounded-xl text-center border border-slate-200 flex flex-col items-center">
          <User size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No doctors found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Doctor</th>
                <th className="px-6 py-4 font-medium">Specialty</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                        {doctor.photo || doctor.user?.profileImage ? (
                          <img
                            src={doctor.photo || doctor.user?.profileImage}
                            alt="Doctor"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500">
                            <User size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                        </div>
                        <div className="text-slate-500 text-xs">{doctor.qualifications[0]?.degree}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900">{doctor.specializations[0]?.specialty}</div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        doctor.currentStatus === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        doctor.currentStatus === 'IN_CONSULTATION' ? 'bg-yellow-100 text-yellow-800' :
                        doctor.currentStatus === 'ON_LEAVE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                     }`}>
                        {doctor.currentStatus.replace('_', ' ')}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/doctors/${doctor.id}`}>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
