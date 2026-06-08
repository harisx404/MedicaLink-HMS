import React, { useState } from 'react';
import { useGetDoctorsQuery } from '../../doctors/api/doctorApi';
import { useGetDoctorQueueQuery, useUpdateAppointmentStatusMutation } from '../api/appointmentApi';
import { Button, LoadingSpinner, Input } from '../../../components/ui';
import type { SharedAppointment, SharedPatient } from '@medicalink/shared';
import { format } from 'date-fns';
import { Play, SkipForward, AlertTriangle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReceptionDashboard: React.FC = () => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [date] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const { data: doctorsRes } = useGetDoctorsQuery({});
  
  const { data: queueRes, isLoading: isQueueLoading } = useGetDoctorQueueQuery(
    { doctorId: selectedDoctorId, date },
    { skip: !selectedDoctorId, pollingInterval: 30000 } // Poll as fallback, socket handles instant
  );

  const [updateStatus] = useUpdateAppointmentStatusMutation();

  const handleAction = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Patient marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const queue: SharedAppointment[] = queueRes?.data || [];
  
  const inConsultation = queue.find(q => q.status === 'IN_CONSULTATION');
  const waiting = queue.filter(q => q.status === 'CHECKED_IN');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Queue Management</h1>
          <p className="text-slate-500 mt-1">Live patient queue control</p>
        </div>
        <div>
          <Button variant="outline" onClick={() => window.location.href = '/appointments'}>
            Back to List
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="w-64">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Doctor</label>
          <select 
            className="w-full h-10 rounded-md border border-slate-300 bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            <option value="">-- Choose Doctor --</option>
            {doctorsRes?.data?.map(doc => (
              <option key={doc.id} value={doc.userId as any}>
                Dr. {(doc.userId as any)?.lastName} - {doc.specializations[0]?.specialty}
              </option>
            ))}
          </select>
        </div>
        <div className="w-48">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
          <Input type="date" value={date} disabled className="bg-slate-50 text-slate-500" />
        </div>
      </div>

      {!selectedDoctorId ? (
        <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Select a doctor to view their live queue</p>
        </div>
      ) : isQueueLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* NOW SERVING */}
          <div className="col-span-1 lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-primary/10 border-b border-primary/20 px-6 py-4">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <Play className="w-4 h-4" /> Now Serving
              </h3>
            </div>
            <div className="p-6">
              {inConsultation ? (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center text-4xl font-black mx-auto shadow-inner">
                    {inConsultation.tokenNumber}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-800">
                      {(inConsultation.patient as SharedPatient)?.firstName} {(inConsultation.patient as SharedPatient)?.lastName}
                    </h4>
                    <p className="text-sm text-slate-500">UHID: {(inConsultation.patient as SharedPatient)?.uhid}</p>
                  </div>
                  <div className="pt-4 flex justify-center gap-2">
                    <Button onClick={() => handleAction(inConsultation._id!, 'COMPLETED')} className="bg-green-600 hover:bg-green-700">
                      Complete Consult
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 text-slate-300">--</div>
                  <p>No patient in consultation</p>
                </div>
              )}
            </div>
          </div>

          {/* WAITING LIST */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-amber-700 flex items-center gap-2">
                <Users className="w-4 h-4" /> Checked-In Waiting List ({waiting.length})
              </h3>
              {waiting.length > 0 && !inConsultation && (
                <Button 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700 shadow-sm"
                  onClick={() => handleAction(waiting[0]._id!, 'IN_CONSULTATION')}
                >
                  <SkipForward className="w-4 h-4 mr-1" /> Call Next (Token {waiting[0].tokenNumber})
                </Button>
              )}
            </div>
            
            <div className="p-0 flex-1 overflow-auto max-h-[500px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Token</th>
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Time Slot</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {waiting.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No checked-in patients waiting.</td></tr>
                  ) : (
                    waiting.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50 group">
                        <td className="px-6 py-4 font-bold text-lg text-slate-700">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm mr-2">{app.tokenNumber}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {(app.patient as SharedPatient)?.firstName} {(app.patient as SharedPatient)?.lastName}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {app.timeSlot.start}
                        </td>
                        <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() => handleAction(app._id!, 'IN_CONSULTATION')}
                            >
                              Call Now
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleAction(app._id!, 'NO_SHOW')}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
