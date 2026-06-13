import React from 'react';
import { useGetSessionsQuery } from '../api/telemedicineApi';
import { TeleconsultationStatus } from '@medicalink/shared';
import { History, Video, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const TelemedicineHistory: React.FC = () => {
  const { data, isLoading } = useGetSessionsQuery();
  const sessions = data?.data?.filter(s => s.status === TeleconsultationStatus.COMPLETED) || [];

  if (isLoading) return <div className="p-8">Loading history...</div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <History className="h-6 w-6 text-indigo-600" />
          Consultation History
        </h1>
        <p className="text-slate-500 text-sm mt-1">Review past telemedicine sessions and access recordings.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-4 font-medium">Date & Time</th>
              <th className="p-4 font-medium">Patient</th>
              <th className="p-4 font-medium">Duration</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map(session => (
              <tr key={session._id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="text-sm text-slate-800">{format(new Date(session.scheduledAt), 'MMM dd, yyyy')}</div>
                  <div className="text-xs text-slate-500">{format(new Date(session.scheduledAt), 'hh:mm a')}</div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-slate-800">{session.patient.name}</div>
                  <div className="text-xs text-slate-500">ID: {session.patient.userId}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    {session.duration || 0} mins
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                    Completed
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-4">View Notes</button>
                  <button className="text-slate-600 hover:text-slate-800 text-sm font-medium flex items-center gap-1 inline-flex">
                    <Video className="h-4 w-4" /> Recording
                  </button>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No past consultations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
