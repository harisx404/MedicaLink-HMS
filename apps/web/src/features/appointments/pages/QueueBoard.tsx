import React, { useEffect, useState } from 'react';
import { useGetDoctorQueueQuery } from '../api/appointmentApi';
import type { SharedAppointment, SharedPatient } from '@medicalink/shared';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const QueueBoard: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const doctorId = searchParams.get('doctor') || '';
  
  const [date] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: queueRes } = useGetDoctorQueueQuery(
    { doctorId, date },
    { skip: !doctorId, pollingInterval: 30000 }
  );

  const queue: SharedAppointment[] = queueRes?.data || [];
  
  const inConsultation = queue.find(q => q.status === 'IN_CONSULTATION');
  const waiting = queue.filter(q => q.status === 'CHECKED_IN');

  if (!doctorId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <p>Please provide ?doctor=USER_ID in the URL to display the queue.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-8 py-6 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.5)]">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">MedicaLink Hospital</h1>
            <p className="text-slate-400 font-medium">Outpatient Department</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold tracking-wider text-slate-100">{format(currentTime, 'HH:mm:ss')}</div>
          <div className="text-lg text-slate-400 font-medium uppercase">{format(currentTime, 'EEEE, dd MMMM yyyy')}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex p-8 gap-8">
        {/* NOW SERVING (Left Half) */}
        <div className="w-1/2 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-green-400"></div>
          
          <div className="p-8 text-center bg-slate-800/50">
            <h2 className="text-3xl font-bold text-slate-300 tracking-widest uppercase mb-12">Now Serving</h2>
            
            {inConsultation ? (
              <div className="flex flex-col items-center justify-center h-full space-y-10">
                <div className="w-64 h-64 bg-slate-700 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(14,165,233,0.3)] border-4 border-primary relative">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-full border-4 border-slate-800"></div>
                  <span className="text-9xl font-black text-white">{inConsultation.tokenNumber}</span>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-5xl font-bold text-slate-100">
                    {(inConsultation.patient as SharedPatient)?.firstName} {(inConsultation.patient as SharedPatient)?.lastName}
                  </h3>
                  <p className="text-2xl text-slate-400">Room 1</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-32 opacity-50">
                <span className="text-9xl font-black text-slate-600 mb-8">--</span>
                <p className="text-3xl text-slate-500">Please Wait</p>
              </div>
            )}
          </div>
        </div>

        {/* WAITING LIST (Right Half) */}
        <div className="w-1/2 flex flex-col gap-6">
          {/* NEXT PATIENT */}
          {waiting.length > 0 && (
            <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
              <h2 className="text-xl font-bold text-amber-500 tracking-widest uppercase mb-6">Next in Line</h2>
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-inner">
                  {waiting[0].tokenNumber}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-100">
                    {(waiting[0].patient as SharedPatient)?.firstName} {(waiting[0].patient as SharedPatient)?.lastName}
                  </h3>
                  <p className="text-lg text-slate-400 mt-1">Please be ready</p>
                </div>
              </div>
            </div>
          )}

          {/* OTHERS WAITING */}
          <div className="flex-1 bg-slate-800 rounded-3xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
            <div className="bg-slate-800/80 px-8 py-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-300 tracking-widest uppercase">Waiting Queue</h2>
              <span className="px-4 py-1 bg-slate-700 text-slate-300 rounded-full text-sm font-bold">
                {Math.max(0, waiting.length - 1)} Waiting
              </span>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <div className="space-y-3">
                {waiting.slice(1, 6).map((app) => (
                  <div key={app._id} className="bg-slate-700/50 rounded-2xl p-5 flex items-center justify-between border border-slate-600/50">
                    <div className="flex items-center gap-6">
                      <span className="text-2xl font-black text-slate-400 w-12 text-center">#{app.tokenNumber}</span>
                      <span className="text-xl font-bold text-slate-200">{(app.patient as SharedPatient)?.firstName} {(app.patient as SharedPatient)?.lastName}</span>
                    </div>
                    <span className="text-slate-400 font-medium">{app.timeSlot.start}</span>
                  </div>
                ))}
                {waiting.length === 1 && (
                  <div className="text-center py-12 text-slate-500 text-xl">No other patients waiting.</div>
                )}
                {waiting.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xl">Queue is empty.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ticker Footer */}
      <footer className="bg-primary text-white py-3 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-[marquee_20s_linear_infinite]">
          <span className="text-xl font-medium tracking-wide">
            *** PLEASE MAINTAIN SILENCE IN THE WAITING AREA *** WEAR YOUR MASK AT ALL TIMES *** PLEASE KEEP YOUR DOCUMENTS READY *** 
          </span>
        </div>
      </footer>
    </div>
  );
};
