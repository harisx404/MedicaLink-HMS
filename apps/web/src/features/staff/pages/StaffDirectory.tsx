import React, { useState } from 'react';
import { useGetStaffQuery } from '../api/staffApi';
import { Search, Plus, UserCircle, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import { Button, Input } from '../../../components/ui';
import { Link } from 'react-router-dom';

export const StaffDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading, isError } = useGetStaffQuery({
    role: roleFilter || undefined,
    search: searchTerm || undefined,
  });

  const staff = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Directory</h1>
          <p className="text-slate-500">Manage all non-doctor hospital employees</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to="/staff/new">
            <Button variant="primary" className="gap-2 w-full sm:w-auto">
              <Plus size={18} />
              Add Staff
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <select
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="NURSE">Nurse</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="LAB_TECHNICIAN">Lab Technician</option>
              <option value="BILLING_STAFF">Billing Staff</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-red-500 p-6 rounded-xl text-center border border-red-100">
          Failed to load staff directory. Please try again later.
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-slate-50 text-slate-500 p-12 rounded-xl text-center border border-slate-200 flex flex-col items-center">
          <UserCircle size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No staff members found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Last Login</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staff.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold overflow-hidden">
                           {employee.profileImage ? (
                              <img src={employee.profileImage} alt="" className="w-full h-full object-cover" />
                           ) : (
                              `${employee.firstName[0]}${employee.lastName[0]}`
                           )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-slate-500 text-xs">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                         {employee.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       {employee.isActive ? (
                          <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                             <CheckCircle2 size={14} /> Active
                          </span>
                       ) : (
                          <span className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                             <XCircle size={14} /> Inactive
                          </span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                       {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-slate-100">
                          <MoreVertical size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
