import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, ConfirmDialog } from '../../components/common';
import { 
  useGetRolesQuery, 
  useCreateRoleMutation, 
  useUpdateRoleMutation, 
  useDeleteRoleMutation 
} from './hospitalAdminApi';

const AVAILABLE_PERMISSIONS = [
  { group: 'Dashboard', key: 'viewDashboard', label: 'View Dashboard' },
  { group: 'Departments', key: 'viewDepartments', label: 'View Departments' },
  { group: 'Departments', key: 'manageDepartments', label: 'Manage Departments' },
  { group: 'Wards & Beds', key: 'viewWards', label: 'View Wards' },
  { group: 'Wards & Beds', key: 'manageWards', label: 'Manage Wards' },
  { group: 'Wards & Beds', key: 'manageBeds', label: 'Manage Beds' },
  { group: 'Staff', key: 'viewStaff', label: 'View Staff' },
  { group: 'Staff', key: 'manageStaff', label: 'Manage Staff' },
  { group: 'Roles', key: 'viewRoles', label: 'View Roles' },
  { group: 'Roles', key: 'manageRoles', label: 'Manage Roles' },
  { group: 'Settings', key: 'viewSettings', label: 'View Settings' },
  { group: 'Settings', key: 'manageSettings', label: 'Manage Settings' },
];

export function RoleManagement() {
  const { data: rolesRes, isLoading } = useGetRolesQuery();
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      description: '',
      permissions: AVAILABLE_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.key]: false }), {} as Record<string, boolean>),
    }
  });

  const permissionsState = watch('permissions');

  const roles = rolesRes?.data || [];

  const handleOpenModal = (role: any = null) => {
    if (role) {
      setEditingRole(role);
      reset({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || AVAILABLE_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.key]: false }), {} as Record<string, boolean>),
      });
    } else {
      setEditingRole(null);
      reset({
        name: '',
        description: '',
        permissions: AVAILABLE_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.key]: false }), {} as Record<string, boolean>),
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingRole) {
        await updateRole({ id: editingRole._id, data }).unwrap();
      } else {
        await createRole(data).unwrap();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save role', error);
    }
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete._id).unwrap();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete role', error);
    }
  };

  const togglePermissionGroup = (groupName: string, checked: boolean) => {
    const groupPerms = AVAILABLE_PERMISSIONS.filter((p) => p.group === groupName);
    const newPerms = { ...permissionsState };
    groupPerms.forEach((p) => {
      newPerms[p.key as keyof typeof newPerms] = checked;
    });
    setValue('permissions', newPerms);
  };

  const columns = [
    {
      header: 'Role Name',
      accessor: (row: any) => (
        <div>
          <div className="font-medium text-slate-900">{row.name}</div>
          <div className="text-xs text-slate-500">{row.description}</div>
        </div>
      )
    },
    {
      header: 'Permissions Count',
      accessor: (row: any) => {
        const count = Object.values(row.permissions || {}).filter(Boolean).length;
        return <div className="text-sm text-slate-600">{count} permissions</div>;
      }
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center space-x-3">
          <button onClick={() => handleOpenModal(row)} className="text-slate-400 hover:text-indigo-600">
            <Edit2 className="w-4 h-4" />
          </button>
          {row.isCustom !== false && (
            <button
              onClick={() => {
                setRoleToDelete(row);
                setDeleteModalOpen(true);
              }}
              className="text-slate-400 hover:text-rose-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Group permissions for matrix view
  const permissionGroups = Array.from(new Set(AVAILABLE_PERMISSIONS.map(p => p.group)));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Role Management"
        description="Manage custom roles and granular permissions for hospital staff."
        action={
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Role
          </button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable data={roles} columns={columns} isLoading={isLoading} />
      </div>

      {/* Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">
                {editingRole ? 'Edit Custom Role' : 'Create Custom Role'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                    <input
                      {...register('name', { required: true })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                      placeholder="e.g. Senior Nurse"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <input
                      {...register('description')}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                      placeholder="Optional description"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Permission Matrix</h3>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    {permissionGroups.map((group, idx) => {
                      const groupPerms = AVAILABLE_PERMISSIONS.filter(p => p.group === group);
                      const isGroupFullyChecked = groupPerms.every(p => (permissionsState as any)?.[p.key]);
                      
                      return (
                        <div key={group} className={idx !== 0 ? 'border-t border-slate-200' : ''}>
                          <div className="px-6 py-3 bg-slate-100 flex justify-between items-center">
                            <span className="font-semibold text-slate-800">{group}</span>
                            <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={isGroupFullyChecked}
                                onChange={(e) => togglePermissionGroup(group, e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-600"
                              />
                              <span>Select All</span>
                            </label>
                          </div>
                          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white">
                            {groupPerms.map(perm => (
                              <label key={perm.key} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  {...register(`permissions.${perm.key}` as any)}
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                />
                                <span className="text-sm font-medium text-slate-700">{perm.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="role-form"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                {editingRole ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Role"
        description={`Are you sure you want to delete ${roleToDelete?.name}? Users with this role might lose access.`}
        confirmText="Delete Role"
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
        isDestructive={true}
      />
    </div>
  );
}
