import React, { useState } from 'react';
import { useGetInventoryQuery, useGetDonorsQuery, useAddBloodUnitMutation, useUpdateTestResultsMutation } from '../api/bloodBankApi';
import { Droplet, Plus, Filter, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { BloodGroup, BloodComponentType, BloodUnitStatus } from '@medicalink/shared';

export const BloodInventory: React.FC = () => {
  const { data: inventoryData, isLoading } = useGetInventoryQuery();
  const { data: donorsData } = useGetDonorsQuery();
  const [addUnit, { isLoading: isAdding }] = useAddBloodUnitMutation();
  const [updateTests, { isLoading: isUpdatingTests }] = useUpdateTestResultsMutation();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null); // For test results modal
  
  const inventory = inventoryData?.data || [];
  const donors = donorsData?.data || [];

  const [formData, setFormData] = useState({
    unitNumber: '', bloodGroup: "A+" as BloodGroup, rhFactor: 'POSITIVE',
    componentType: BloodComponentType.WHOLE_BLOOD, collectedFrom: '',
    collectedDate: new Date().toISOString().split('T')[0],
    expiryDate: '', volume: '450', bagType: 'Single'
  });

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUnit({
        ...formData,
        volume: parseInt(formData.volume, 10),
        collectedFrom: formData.collectedFrom || undefined
      }).unwrap();
      setShowAddModal(false);
      setFormData({
        unitNumber: '', bloodGroup: "A+" as BloodGroup, rhFactor: 'POSITIVE',
        componentType: BloodComponentType.WHOLE_BLOOD, collectedFrom: '',
        collectedDate: new Date().toISOString().split('T')[0],
        expiryDate: '', volume: '450', bagType: 'Single'
      });
    } catch (error) {
      console.error('Failed to add unit', error);
    }
  };

  const handleUpdateTests = async (tests: any) => {
    if (!selectedUnit) return;
    try {
      await updateTests({ id: selectedUnit._id, tests }).unwrap();
      setSelectedUnit(null);
    } catch (error) {
      console.error('Failed to update tests', error);
    }
  };

  const getStatusBadge = (status: BloodUnitStatus) => {
    switch(status) {
      case BloodUnitStatus.AVAILABLE: return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">AVAILABLE</span>;
      case BloodUnitStatus.RESERVED: return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">RESERVED</span>;
      case BloodUnitStatus.ISSUED: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">ISSUED</span>;
      case BloodUnitStatus.DISCARDED: return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">DISCARDED</span>;
      case BloodUnitStatus.EXPIRED: return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">EXPIRED</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Droplet className="text-red-600 mr-2" size={24} />
            Blood Inventory
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage collected blood units and update serology test results.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Unit No..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-48"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus size={18} className="mr-2" /> Collect Unit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Unit No.</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Component</th>
                <th className="px-6 py-4">Collection Date</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Tests Status</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500 animate-pulse">Loading inventory...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500">No units in inventory.</td></tr>
              ) : inventory.map((unit) => {
                const testsPending = Object.values(unit.tests).includes('PENDING');
                const testsFailed = Object.values(unit.tests).includes('POSITIVE');
                
                return (
                  <tr key={unit._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-700 font-bold">{unit.unitNumber}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center font-bold text-red-600">
                        {unit.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{unit.componentType.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(unit.collectedDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(unit.expiryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {testsFailed ? (
                        <span className="flex items-center text-red-600 font-medium text-xs"><AlertTriangle size={14} className="mr-1"/> FAILED</span>
                      ) : testsPending ? (
                        <span className="flex items-center text-amber-600 font-medium text-xs"><AlertTriangle size={14} className="mr-1"/> PENDING</span>
                      ) : (
                        <span className="flex items-center text-emerald-600 font-medium text-xs"><CheckCircle size={14} className="mr-1"/> PASSED</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(unit.status)}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedUnit(unit)}
                        className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                      >
                        Update Tests
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Add New Blood Unit</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleAddUnit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit Number</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                    value={formData.unitNumber} onChange={e => setFormData({...formData, unitNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Component Type</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    value={formData.componentType} onChange={e => setFormData({...formData, componentType: e.target.value as BloodComponentType})}>
                    {Object.values(BloodComponentType).map(ct => <option key={ct} value={ct}>{ct.replace('_', ' ')}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                      value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value as BloodGroup})}>
                      {Object.values(BloodGroup).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rh Factor</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                      value={formData.rhFactor} onChange={e => setFormData({...formData, rhFactor: e.target.value})}>
                      <option value="POSITIVE">Positive (+)</option>
                      <option value="NEGATIVE">Negative (-)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Collected From (Donor)</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    value={formData.collectedFrom} onChange={e => setFormData({...formData, collectedFrom: e.target.value})}>
                    <option value="">-- Select Donor --</option>
                    {donors.map(d => <option key={d._id} value={d._id}>{d.donorId} - {d.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Collection Date</label>
                    <input required type="date" className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                      value={formData.collectedDate} onChange={e => setFormData({...formData, collectedDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                    <input required type="date" className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                      value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Volume (ml)</label>
                    <input required type="number" className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                      value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bag Type</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                      value={formData.bagType} onChange={e => setFormData({...formData, bagType: e.target.value})}>
                      <option>Single</option><option>Double</option><option>Triple</option><option>Quadruple</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" disabled={isAdding} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Tests Modal */}
      {selectedUnit && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
         <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
           <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <h2 className="text-lg font-bold text-slate-800">Serology Tests - {selectedUnit.unitNumber}</h2>
             <button onClick={() => setSelectedUnit(null)} className="text-slate-400 hover:text-slate-600">✕</button>
           </div>
           
           <div className="p-6">
             <div className="space-y-4">
               {['hiv', 'hbsag', 'hcv', 'vdrl', 'malaria'].map(testName => (
                 <div key={testName} className="flex items-center justify-between">
                   <span className="text-sm font-medium text-slate-700 uppercase">{testName}</span>
                   <select 
                      className="border border-slate-200 rounded p-1 text-sm bg-white"
                      defaultValue={selectedUnit.tests[testName]}
                      id={`test-${testName}`}
                   >
                     <option value="PENDING">PENDING</option>
                     <option value="NEGATIVE">NEGATIVE</option>
                     <option value="POSITIVE">POSITIVE</option>
                   </select>
                 </div>
               ))}
             </div>
             
             <div className="mt-8 flex justify-end gap-3">
               <button onClick={() => setSelectedUnit(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Cancel</button>
               <button 
                  onClick={() => {
                    const tests = {
                      hiv: (document.getElementById('test-hiv') as HTMLSelectElement).value,
                      hbsag: (document.getElementById('test-hbsag') as HTMLSelectElement).value,
                      hcv: (document.getElementById('test-hcv') as HTMLSelectElement).value,
                      vdrl: (document.getElementById('test-vdrl') as HTMLSelectElement).value,
                      malaria: (document.getElementById('test-malaria') as HTMLSelectElement).value,
                    };
                    handleUpdateTests(tests);
                  }} 
                  disabled={isUpdatingTests} 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                >
                 Update Results
               </button>
             </div>
           </div>
         </div>
       </div>
      )}
    </div>
  );
};
