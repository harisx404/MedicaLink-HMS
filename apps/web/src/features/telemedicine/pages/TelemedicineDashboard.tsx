import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetSessionsQuery, useCreateSessionMutation } from '../api/telemedicineApi';
import { TeleconsultationStatus } from '@medicalink/shared';
import { Video, Clock, User, Plus, Search, Activity, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export const TelemedicineDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetSessionsQuery(undefined, { pollingInterval: 10000 });
  const [createSession, { isLoading: isCreating }] = useCreateSessionMutation();
  const [searchTerm, setSearchTerm] = useState('');

  const sessions = data?.data || [];

  const waitingSessions = sessions.filter(s => s.status === TeleconsultationStatus.WAITING);
  const activeSessions = sessions.filter(s => s.status === TeleconsultationStatus.ACTIVE);


  const handleCreateMockSession = async () => {
    try {
      await createSession({
        patient: { userId: 'patient123', name: 'John Doe' },
        doctor: { userId: 'doctor123', name: 'Dr. Smith' },
        scheduledAt: new Date().toISOString(),
        status: TeleconsultationStatus.WAITING
      }).unwrap();
      // Optionally navigate or show toast
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Video className="h-6 w-6 text-indigo-600" />
            Telemedicine Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage virtual consultations and waiting rooms.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/portal/waiting-room/test')}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Patient View Demo
          </button>
          <button 
            onClick={handleCreateMockSession}
            disabled={isCreating}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Walk-in Virtual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Patients Waiting</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{waitingSessions.length}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Consultations</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{activeSessions.length}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Today's Total</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{sessions.length}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="font-semibold text-slate-800">Virtual Waiting Room Queue</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search patients..."
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {waitingSessions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No patients waiting currently.</div>
          ) : (
            waitingSessions.map(session => (
              <div key={session._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {session.patient.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{session.patient.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Scheduled: {format(new Date(session.scheduledAt), 'hh:mm a')}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full inline-flex items-center gap-1 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    Waiting
                  </span>
                </div>
                <div>
                  <button 
                    onClick={() => navigate(`/app/telemedicine/session/${session._id}`)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Start Call
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Active and Upcoming Sections can be added similarly */}
    </div>
  );
};
