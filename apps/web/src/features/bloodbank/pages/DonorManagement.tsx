import React, { useState } from 'react';
import { useGetDonorsQuery, useRegisterDonorMutation } from '../api/bloodBankApi';
import { Users, Plus, Droplet, Check, AlertCircle } from 'lucide-react';
import { BloodGroup } from '@medicalink/shared';

export const DonorManagement: React.FC = () => {
  const { data: donorsData, isLoading } = useGetDonorsQuery();
  const [registerDonor, { isLoading: isRegistering }] = useRegisterDonorMutation();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', bloodGroup: "A+" as BloodGroup, rhFactor: 'POSITIVE',
    phone: '', address: '', weight: '', healthHistory: ''
  });

  const donors = donorsData?.data || [];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerDonor({
        ...formData,
        age: parseInt(formData.age, 10),
        weight: parseInt(formData.weight, 10),
      }).unwrap();
      setShowModal(false);
      setFormData({
        name: '', age: '', gender: 'Male', bloodGroup: "A+" as BloodGroup, rhFactor: 'POSITIVE',
        phone: '', address: '', weight: '', healthHistory: ''
      });
    } catch (error) {
      console.error('Failed to register donor', error);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Users className="text-indigo-600 mr-2" size={24} />
            Donor Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Register new blood donors and view donation history.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Register Donor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Donor ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Age/Gender</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 animate-pulse">Loading donors...</td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No donors registered yet.</td>
                </tr>
              ) : donors.map((donor) => (
                <tr key={donor._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-600">{donor.donorId}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{donor.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Droplet size={10} className="mr-1" fill="currentColor" /> {donor.bloodGroup}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{donor.age} / {donor.gender}</td>
                  <td className="px-6 py-4 text-slate-600">{donor.phone}</td>
                  <td className="px-6 py-4">
                    {donor.eligibilityStatus === 'ELIGIBLE' ? (
                      <span className="flex items-center text-emerald-600 font-medium text-xs">
                        <Check size={14} className="mr-1" /> Eligible
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600 font-medium text-xs">
                        <AlertCircle size={14} className="mr-1" /> Deferred
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Register New Donor</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleRegister} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input required type="number" className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                      value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                      value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                  <input required type="number" className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                    value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Health History Notes</label>
                  <textarea className="w-full border border-slate-200 rounded-lg p-2 text-sm h-20" 
                    value={formData.healthHistory} onChange={e => setFormData({...formData, healthHistory: e.target.value})}></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" disabled={isRegistering} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
                  Register Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
