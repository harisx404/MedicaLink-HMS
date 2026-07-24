import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCaseByIdQuery, useUpdateCaseStatusMutation } from '../api/otApi';
import { OTCaseStatus } from '@medicalink/shared';
import { ArrowLeft, CheckCircle2, AlertTriangle, Save, Play, Square, Activity, User as UserIcon } from 'lucide-react';

export const OTCaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: caseData, isLoading } = useGetCaseByIdQuery(id as string, { skip: !id });
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateCaseStatusMutation();
  // const [updateSection, { isLoading: isUpdatingSection }] = useUpdateCaseSectionMutation();

  const otCase = caseData?.data;
  const initialTab = otCase?.status === OTCaseStatus.IN_PROGRESS ? 'intraOp' : otCase?.status === OTCaseStatus.COMPLETED ? 'postOp' : otCase?.status ? 'preOp' : 'schedule';
  const [userTab, setUserTab] = useState<'schedule' | 'preOp' | 'intraOp' | 'postOp' | null>(null);
  const activeTab = userTab || initialTab;
  const setActiveTab = (tab: 'schedule' | 'preOp' | 'intraOp' | 'postOp') => setUserTab(tab);

  if (isLoading || !otCase) {
    return <div className="p-12 text-center text-slate-500 animate-pulse">Loading case details...</div>;
  }

  const handleStatusChange = async (newStatus: OTCaseStatus) => {
    try {
      await updateStatus({ id: otCase._id, status: newStatus }).unwrap();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const getStatusBadge = (status: OTCaseStatus) => {
    switch(status) {
      case OTCaseStatus.SCHEDULED: return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">SCHEDULED</span>;
      case OTCaseStatus.IN_PREP: return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">IN PREP</span>;
      case OTCaseStatus.IN_PROGRESS: return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">IN PROGRESS</span>;
      case OTCaseStatus.COMPLETED: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">COMPLETED</span>;
      case OTCaseStatus.CANCELLED: return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">CANCELLED</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/ot/schedule')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{otCase.caseNumber}</h1>
              {getStatusBadge(otCase.status)}
            </div>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              {otCase.procedure?.name} • {otCase.patient?.firstName} {otCase.patient?.lastName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {otCase.status === OTCaseStatus.SCHEDULED && (
            <button 
              onClick={() => handleStatusChange(OTCaseStatus.IN_PREP)}
              className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium shadow-sm"
              disabled={isUpdatingStatus}
            >
              Start Preparation
            </button>
          )}
          {otCase.status === OTCaseStatus.IN_PREP && (
            <button 
              onClick={() => handleStatusChange(OTCaseStatus.IN_PROGRESS)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
              disabled={isUpdatingStatus}
            >
              <Play size={16} className="mr-2" /> Start Surgery
            </button>
          )}
          {otCase.status === OTCaseStatus.IN_PROGRESS && (
            <button 
              onClick={() => handleStatusChange(OTCaseStatus.COMPLETED)}
              className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium shadow-sm"
              disabled={isUpdatingStatus}
            >
              <Square size={16} className="mr-2" /> End Surgery
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
          {[
            { id: 'schedule', label: 'Scheduling Info' },
            { id: 'preOp', label: 'Pre-Op Preparation', disabled: otCase.status === OTCaseStatus.SCHEDULED && false }, // Actually allow viewing
            { id: 'intraOp', label: 'Intra-Op Record', disabled: [OTCaseStatus.SCHEDULED, OTCaseStatus.IN_PREP].includes(otCase.status) },
            { id: 'postOp', label: 'Post-Op & Recovery', disabled: otCase.status !== OTCaseStatus.COMPLETED }
          ].map((tab) => (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                  : tab.disabled 
                    ? 'border-transparent text-slate-400 cursor-not-allowed bg-slate-50 opacity-60' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 text-lg border-b pb-2">Procedure Details</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-slate-500">Theater</div>
                  <div className="col-span-2 font-medium text-slate-800">{otCase.theater?.name}</div>
                  
                  <div className="text-slate-500">Date & Time</div>
                  <div className="col-span-2 font-medium text-slate-800">{new Date(otCase.scheduledDate).toLocaleDateString()} @ {otCase.scheduledTime}</div>
                  
                  <div className="text-slate-500">Est. Duration</div>
                  <div className="col-span-2 font-medium text-slate-800">{otCase.estimatedDuration} mins</div>
                  
                  <div className="text-slate-500">Type</div>
                  <div className="col-span-2 font-medium text-slate-800">{otCase.procedure?.type}</div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 text-lg border-b pb-2">Surgical Team</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-slate-500">Lead Surgeon</div>
                  <div className="col-span-2 font-medium text-slate-800">
                    {otCase.surgeon?.map((s: any) => `Dr. ${s.firstName} ${s.lastName}`).join(', ')}
                  </div>
                  
                  <div className="text-slate-500">Anesthesiologist</div>
                  <div className="col-span-2 font-medium text-slate-800">
                    {otCase.anesthesiologist ? `Dr. ${otCase.anesthesiologist.firstName} ${otCase.anesthesiologist.lastName}` : 'Not Assigned'}
                  </div>
                  
                  <div className="text-slate-500">Scrub Nurse</div>
                  <div className="col-span-2 font-medium text-slate-800">
                    {otCase.scrubNurse ? `${otCase.scrubNurse.firstName} ${otCase.scrubNurse.lastName}` : 'Not Assigned'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preOp' && (
            <div className="space-y-8">
              <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg flex items-start gap-3 border border-indigo-100">
                <CheckCircle2 className="mt-0.5 flex-shrink-0 text-indigo-600" size={20} />
                <div>
                  <h4 className="font-semibold">WHO Surgical Safety Checklist</h4>
                  <p className="text-sm mt-1 text-indigo-700/80">Complete all pre-operative checks before inducting anesthesia. This section is currently view-only for the prototype demo.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-lg p-5">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center"><UserIcon size={18} className="mr-2 text-slate-400"/> Patient Verification</h4>
                  <div className="space-y-3">
                    {['Patient identity confirmed', 'Site marked', 'Anesthesia machine check complete', 'Pulse oximeter on patient and functioning'].map((item, i) => (
                      <label key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" defaultChecked={i < 2} />
                        <span className="text-sm text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="border border-slate-200 rounded-lg p-5">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center"><AlertTriangle size={18} className="mr-2 text-slate-400"/> Critical Risk Checks</h4>
                  <div className="space-y-3">
                    {['Known allergies?', 'Difficult airway/aspiration risk?', 'Risk of >500ml blood loss?'].map((item, i) => (
                      <label key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                        <span className="text-sm text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'intraOp' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-6 rounded-xl">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                     <Activity size={24} />
                   </div>
                   <div>
                     <h3 className="text-emerald-900 font-bold text-lg">Case In Progress</h3>
                     <p className="text-emerald-700 text-sm">Timer started at {otCase.intraOp?.actualStartTime ? new Date(otCase.intraOp.actualStartTime).toLocaleTimeString() : 'N/A'}</p>
                   </div>
                 </div>
                 <div className="text-4xl font-mono font-bold text-emerald-600 tracking-widest">
                   01:24:00
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Surgeon's Intra-Op Notes</label>
                   <textarea 
                     className="w-full border border-slate-200 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                     placeholder="Enter findings during surgery..."
                   ></textarea>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Complications (if any)</label>
                   <textarea 
                     className="w-full border border-red-200 bg-red-50/30 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                     placeholder="Log any complications..."
                   ></textarea>
                 </div>
               </div>
               
               <div className="flex justify-end">
                 <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                   <Save size={16} className="mr-2" /> Save Notes
                 </button>
               </div>
            </div>
          )}

          {activeTab === 'postOp' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                 <h3 className="text-xl font-bold text-slate-800">Surgery Completed</h3>
                 <p className="text-slate-500 text-sm mt-1">Duration: 1h 45m</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Post-Op Instructions</label>
                   <textarea 
                     className="w-full border border-slate-200 rounded-lg p-3 text-sm h-32" 
                     placeholder="Instructions for ward/ICU nurse..."
                   ></textarea>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Destination</label>
                   <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm">
                     <option>Select Ward/ICU</option>
                     <option>Surgical ICU - Bed 04</option>
                     <option>General Surgical Ward - Bed 12</option>
                   </select>
                   
                   <div className="mt-4">
                     <label className="block text-sm font-medium text-slate-700 mb-1">Aldrete Recovery Score</label>
                     <input type="number" min="0" max="10" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" placeholder="0-10" />
                   </div>
                 </div>
               </div>
               
               <div className="flex justify-end">
                 <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                   <Save size={16} className="mr-2" /> Complete Record
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
