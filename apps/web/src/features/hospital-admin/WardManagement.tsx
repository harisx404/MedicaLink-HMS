import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Bed, Search, X, Layers, Copy } from 'lucide-react';
import { 
  useGetWardsQuery, 
  useCreateWardMutation, 
  useUpdateWardMutation, 
  useDeleteWardMutation,
  useGetDepartmentsQuery,
  useGetBedsQuery,
  useCreateBedMutation,
  useGenerateBedsMutation,
  useUpdateBedMutation
} from './hospitalAdminApi';
import { DataTable, BedGrid, OccupancyMeter } from '../../components/common';

export function WardManagement() {
  const [activeTab, setActiveTab] = useState<'WARDS' | 'BEDS'>('WARDS');
  const [isWardModalOpen, setIsWardModalOpen] = useState(false);
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  
  const [editingWard, setEditingWard] = useState<any>(null);
  const [editingBed, setEditingBed] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWardForBeds, setSelectedWardForBeds] = useState<string>('');

  // Queries
  const { data: wardsRes, isLoading: isLoadingWards } = useGetWardsQuery({});
  const { data: deptsRes } = useGetDepartmentsQuery({});
  // Fetch all beds so we can calculate occupancy for each ward
  const { data: allBedsRes } = useGetBedsQuery(undefined);

  // Mutations
  const [createWard] = useCreateWardMutation();
  const [updateWard] = useUpdateWardMutation();
  const [deleteWard] = useDeleteWardMutation();
  const [createBed] = useCreateBedMutation();
  const [updateBed] = useUpdateBedMutation();
  const [generateBeds] = useGenerateBedsMutation();

  const { register: regWard, handleSubmit: submitWard, reset: resetWard } = useForm();
  const { register: regBed, handleSubmit: submitBed, reset: resetBed } = useForm();
  const { register: regBulk, handleSubmit: submitBulk, reset: resetBulk } = useForm();

  const wards = wardsRes?.data || [];
  const departments = deptsRes?.data || [];
  const allBeds = allBedsRes?.data || [];

  const filteredWards = wards.filter((w: any) => w.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // For the beds view, filter by selected ward and search term
  const filteredBeds = allBeds.filter((b: any) => {
    const matchesWard = selectedWardForBeds ? b.wardId?._id === selectedWardForBeds || b.wardId === selectedWardForBeds : true;
    const matchesSearch = b.bedNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesWard && matchesSearch;
  });

  // --- WARD HANDLERS ---
  const handleOpenWardModal = (ward: any = null) => {
    setEditingWard(ward);
    if (ward) {
      resetWard({ ...ward, departmentId: ward.departmentId?._id || ward.departmentId });
    } else {
      resetWard({ name: '', code: '', type: 'GENERAL', departmentId: '' });
    }
    setIsWardModalOpen(true);
  };

  const onWardSubmit = async (data: any) => {
    try {
      if (editingWard) {
        await updateWard({ id: editingWard._id, ...data }).unwrap();
        toast.success('Ward updated');
      } else {
        await createWard(data).unwrap();
        toast.success('Ward created');
      }
      setIsWardModalOpen(false);
    } catch (e: any) {
      toast.error(e.data?.message || 'Failed to save ward');
    }
  };

  const onWardDelete = async (id: string) => {
    if (window.confirm('Delete this ward?')) {
      try {
        await deleteWard(id).unwrap();
        toast.success('Ward deleted');
      } catch (e: any) {
        toast.error(e.data?.message || 'Failed to delete ward');
      }
    }
  };

  // --- BED HANDLERS ---
  const handleOpenBedModal = (bed: any = null) => {
    setEditingBed(bed);
    if (bed) {
      resetBed({ ...bed, wardId: bed.wardId?._id || bed.wardId });
    } else {
      resetBed({ bedNumber: '', wardId: selectedWardForBeds, type: 'STANDARD', status: 'AVAILABLE' });
    }
    setIsBedModalOpen(true);
  };

  const onBedSubmit = async (data: any) => {
    try {
      if (editingBed) {
        await updateBed({ id: editingBed._id, ...data }).unwrap();
        toast.success('Bed updated');
      } else {
        await createBed(data).unwrap();
        toast.success('Bed created');
      }
      setIsBedModalOpen(false);
    } catch (e: any) {
      toast.error(e.data?.message || 'Failed to save bed');
    }
  };



  // --- BULK GENERATE HANDLERS ---
  const onBulkSubmit = async (data: any) => {
    try {
      await generateBeds({
        ...data,
        count: Number(data.count)
      }).unwrap();
      toast.success(`${data.count} beds generated successfully`);
      setIsBulkModalOpen(false);
    } catch (e: any) {
      toast.error(e.data?.message || 'Failed to generate beds');
    }
  };

  const wardColumns = [
    {
      header: 'Ward Name',
      accessor: (row: any) => <div className="font-medium text-slate-900">{row.name}</div>,
    },
    {
      header: 'Code',
      accessor: (row: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: (row: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
          {row.type}
        </span>
      ),
    },
    {
      header: 'Department',
      accessor: (row: any) => <div className="text-sm text-slate-600">{row.departmentId?.name || 'N/A'}</div>,
    },
    {
      header: 'Occupancy',
      accessor: (row: any) => {
        const wardBeds = allBeds.filter((b: any) => (b.wardId?._id || b.wardId) === row._id);
        const occupiedBeds = wardBeds.filter((b: any) => b.status === 'OCCUPIED').length;
        return (
          <div className="flex items-center space-x-2">
            <OccupancyMeter total={wardBeds.length} occupied={occupiedBeds} size={40} strokeWidth={4} />
            <div className="text-xs text-slate-500">{occupiedBeds}/{wardBeds.length}</div>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center space-x-3">
          <button onClick={() => { setActiveTab('BEDS'); setSelectedWardForBeds(row._id); }} className="text-emerald-600 hover:text-emerald-900 transition-colors" title="Manage Beds">
            <Bed className="h-4 w-4" />
          </button>
          <button onClick={() => handleOpenWardModal(row)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={() => onWardDelete(row._id)} className="text-rose-600 hover:text-rose-900 transition-colors" title="Delete">
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
            <Layers className="w-6 h-6 mr-2 text-indigo-600" />
            Wards & Beds Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure hospital units, wards, and manage bed inventory.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'WARDS' && (
            <button
              onClick={() => handleOpenWardModal()}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Ward
            </button>
          )}
          {activeTab === 'BEDS' && (
            <>
              <button
                onClick={() => {
                  resetBulk({ wardId: selectedWardForBeds, count: 5, prefix: 'B', type: 'STANDARD' });
                  setIsBulkModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Bulk Generate
              </button>
              <button
                onClick={() => handleOpenBedModal()}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Bed
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('WARDS')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'WARDS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Wards
        </button>
        <button
          onClick={() => setActiveTab('BEDS')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'BEDS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Beds View
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-white"
            placeholder={activeTab === 'WARDS' ? 'Search wards...' : 'Search beds...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'BEDS' && (
          <select
            value={selectedWardForBeds}
            onChange={(e) => setSelectedWardForBeds(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Wards</option>
            {wards.map((w: any) => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Data View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {activeTab === 'WARDS' ? (
          <DataTable data={filteredWards} columns={wardColumns} isLoading={isLoadingWards} />
        ) : (
          <div className="p-6">
            <BedGrid beds={filteredBeds} onBedClick={(bed) => handleOpenBedModal(bed)} />
          </div>
        )}
      </div>

      {/* WARD MODAL */}
      {isWardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md animate-in fade-in zoom-in-95">
            <div className="flex justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">{editingWard ? 'Edit Ward' : 'Add Ward'}</h3>
              <button onClick={() => setIsWardModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submitWard(onWardSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input {...regWard('name', { required: true })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
                <input {...regWard('code', { required: true })} className="w-full px-4 py-2 border rounded-lg uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select {...regWard('type')} className="w-full px-4 py-2 border rounded-lg">
                  <option value="GENERAL">General</option>
                  <option value="ICU">ICU</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="MATERNITY">Maternity</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select {...regWard('departmentId')} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">None</option>
                  {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="pt-4 text-right">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BED MODAL */}
      {isBedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md animate-in fade-in zoom-in-95">
            <div className="flex justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">{editingBed ? 'Edit Bed' : 'Add Bed'}</h3>
              <button onClick={() => setIsBedModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submitBed(onBedSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bed Number *</label>
                <input {...regBed('bedNumber', { required: true })} className="w-full px-4 py-2 border rounded-lg uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ward *</label>
                <select {...regBed('wardId', { required: true })} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Select Ward</option>
                  {wards.map((w: any) => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select {...regBed('type')} className="w-full px-4 py-2 border rounded-lg">
                  <option value="STANDARD">Standard</option>
                  <option value="ICU">ICU Bed</option>
                  <option value="PEDIATRIC">Pediatric</option>
                </select>
              </div>
              {editingBed && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select {...regBed('status')} className="w-full px-4 py-2 border rounded-lg">
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              )}
              <div className="pt-4 text-right">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK GENERATE MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md animate-in fade-in zoom-in-95">
            <div className="flex justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Bulk Generate Beds</h3>
              <button onClick={() => setIsBulkModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submitBulk(onBulkSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ward *</label>
                <select {...regBulk('wardId', { required: true })} className="w-full px-4 py-2 border rounded-lg bg-slate-50">
                  <option value="">Select Ward</option>
                  {wards.map((w: any) => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Number of Beds *</label>
                  <input type="number" min="1" max="100" {...regBulk('count', { required: true })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prefix</label>
                  <input {...regBulk('prefix')} placeholder="e.g. B" className="w-full px-4 py-2 border rounded-lg uppercase" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bed Type</label>
                <select {...regBulk('type')} className="w-full px-4 py-2 border rounded-lg">
                  <option value="STANDARD">Standard</option>
                  <option value="ICU">ICU Bed</option>
                  <option value="PEDIATRIC">Pediatric</option>
                </select>
              </div>
              <p className="text-xs text-slate-500">
                This will automatically generate sequential bed numbers (e.g. B001, B002) in the selected ward.
              </p>
              <div className="pt-4 text-right">
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
