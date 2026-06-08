import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Users, Search, X, Mail } from 'lucide-react';
import { 
  useGetUsersQuery, 
  useCreateUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation,
  useGetDepartmentsQuery
} from './hospitalAdminApi';
import { DataTable } from '../../components/common';

export function StaffList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: usersResponse, isLoading } = useGetUsersQuery({});
  const { data: deptResponse } = useGetDepartmentsQuery({});
  
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const { register, handleSubmit, reset, watch } = useForm();
  
  const selectedRole = watch('role');

  const users = usersResponse?.data || [];
  const departments = deptResponse?.data || [];

  // Filter functionality
  const filteredUsers = users.filter((user: any) => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user: any = null) => {
    setEditingUser(user);
    if (user) {
      reset({
        ...user,
        departmentId: user.department?._id || user.department || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        joinDate: user.joinDate ? new Date(user.joinDate).toISOString().split('T')[0] : '',
      });
    } else {
      reset({ 
        firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR', departmentId: '', 
        isActive: true, gender: 'MALE', phone: '', address: '', staffId: '', employeeId: '',
        designation: '', specialization: '', registrationNumber: '', degree: '', experienceYears: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingUser) {
        // Prevent sending password if it's empty during edit
        if (!data.password) {
          delete data.password;
        }
        await updateUser({ id: editingUser._id, ...data }).unwrap();
        toast.success('Staff member updated successfully');
      } else {
        if (!data.password) data.password = 'TempPass123!'; // Simple fallback, should enforce real passwords
        await createUser(data).unwrap();
        toast.success('Staff member created successfully');
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate/delete this staff member?')) {
      try {
        await deleteUser(id).unwrap();
        toast.success('Staff member removed successfully');
      } catch (err: any) {
        toast.error(err.data?.message || 'Failed to remove staff member');
      }
    }
  };

  const columns = [
    {
      header: 'Staff Member',
      accessor: (row: any) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-700 font-medium text-sm">
              {row.firstName.charAt(0)}{row.lastName.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <div className="font-medium text-slate-900">{row.firstName} {row.lastName}</div>
            <div className="text-xs text-slate-500 flex items-center mt-0.5">
              <Mail className="w-3 h-3 mr-1" />
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (row: any) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          {row.role.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Department',
      accessor: (row: any) => (
        <div className="text-sm text-slate-700">
          {row.department?.name || <span className="text-slate-400 italic">Unassigned</span>}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.isActive 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-100 text-rose-800 border border-rose-200'
        }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenModal(row)}
            className="text-indigo-600 hover:text-indigo-900 transition-colors"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-rose-600 hover:text-rose-900 transition-colors"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Users className="w-6 h-6 mr-2 text-indigo-600" />
            Staff Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage hospital staff, roles, and departmental assignments.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </button>
      </div>

      {/* Filters/Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search staff by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          data={filteredUsers}
          columns={columns}
          isLoading={isLoading}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                    <input {...register('firstName', { required: 'Required' })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                    <input {...register('lastName', { required: 'Required' })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input type="email" {...register('email', { required: 'Required' })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input {...register('phone')} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" {...register('dob')} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select {...register('gender')} className="w-full px-4 py-2 border rounded-lg bg-white">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <input {...register('address')} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-4">Work Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                    <select {...register('role', { required: 'Required' })} className="w-full px-4 py-2 border rounded-lg bg-white">
                      <option value="HOSPITAL_ADMIN">Admin</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="NURSE">Nurse</option>
                      <option value="RECEPTIONIST">Receptionist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                    <select {...register('departmentId')} className="w-full px-4 py-2 border rounded-lg bg-white">
                      <option value="">None</option>
                      {departments.map((dept: any) => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                    <input {...register('employeeId')} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                    <input {...register('designation')} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                    <input type="date" {...register('joinDate')} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password {editingUser && '(Leave blank to keep)'}</label>
                    <input type="password" {...register('password', { required: !editingUser ? 'Required' : false })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Doctor Specific Information */}
              {selectedRole === 'DOCTOR' && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-4">Doctor Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                      <input {...register('specialization')} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Reg Number</label>
                      <input {...register('registrationNumber')} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Degree/Qualification</label>
                      <input {...register('degree')} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Experience (Years)</label>
                      <input type="number" {...register('experienceYears')} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                  </div>
                </div>
              )}

              {editingUser && (
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded border-slate-300" />
                    <span className="text-sm font-medium text-slate-700">Account is Active</span>
                  </label>
                </div>
              )}

              <div className="pt-6 flex items-center justify-end space-x-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-70 flex items-center"
                >
                  {(isCreating || isUpdating) ? 'Saving...' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
