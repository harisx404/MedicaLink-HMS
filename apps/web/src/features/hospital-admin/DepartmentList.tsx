import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Building2, Search, X } from 'lucide-react';
import { 
  useGetDepartmentsQuery, 
  useCreateDepartmentMutation, 
  useUpdateDepartmentMutation, 
  useDeleteDepartmentMutation 
} from './hospitalAdminApi';
import { DataTable } from '../../components/common';

export function DepartmentList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useGetDepartmentsQuery({});
  const [createDept, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDept, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const [deleteDept] = useDeleteDepartmentMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const departments = response?.data || [];

  // Filter functionality
  const filteredDepartments = departments.filter((dept: any) => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (dept = null) => {
    setEditingDept(dept);
    if (dept) {
      reset(dept);
    } else {
      reset({ name: '', code: '', description: '', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingDept) {
        await updateDept({ id: editingDept._id, ...data }).unwrap();
        toast.success('Department updated successfully');
      } else {
        await createDept(data).unwrap();
        toast.success('Department created successfully');
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDept(id).unwrap();
        toast.success('Department deleted successfully');
      } catch (err: any) {
        toast.error(err.data?.message || 'Failed to delete department');
      }
    }
  };

  const columns = [
    {
      header: 'Department Info',
      accessor: (row: any) => (
        <div>
          <div className="font-medium text-slate-900">{row.name}</div>
          <div className="text-xs text-slate-500 mt-1">{row.description || 'No description provided'}</div>
        </div>
      ),
    },
    {
      header: 'Code',
      accessor: (row: any) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 'ACTIVE' 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-100 text-rose-800 border border-rose-200'
        }`}>
          {row.status}
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
            title="Delete"
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
            <Building2 className="w-6 h-6 mr-2 text-indigo-600" />
            Departments
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage clinical and administrative departments.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
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
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          data={filteredDepartments}
          columns={columns}
          isLoading={isLoading}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department Name *
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Cardiology"
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department Code *
                </label>
                <input
                  {...register('code', { required: 'Code is required' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                  placeholder="e.g. CARDIO"
                />
                {errors.code && <p className="text-rose-500 text-xs mt-1">{errors.code.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Brief description of the department's focus..."
                />
              </div>

              {editingDept && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
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
                  {(isCreating || isUpdating) ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
