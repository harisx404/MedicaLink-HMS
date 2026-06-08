import React from 'react';
import { Calendar, Video, FileText, ChevronRight, Activity, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PortalDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Good morning, John!</h2>
          <p className="text-indigo-100 text-sm">Your health profile is up to date.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50 flex flex-col items-center justify-center gap-3 hover:bg-indigo-50/50 transition-colors group">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar size={24} />
          </div>
          <span className="font-semibold text-gray-800 text-sm">Book Clinic</span>
        </button>
        <button className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50 flex flex-col items-center justify-center gap-3 hover:bg-indigo-50/50 transition-colors group">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Video size={24} />
          </div>
          <span className="font-semibold text-gray-800 text-sm">Telemedicine</span>
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-gray-900">Upcoming Appointments</h3>
          <button className="text-sm font-semibold text-indigo-600">See All</button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-14 h-16 bg-indigo-50 rounded-xl flex flex-col items-center justify-center border border-indigo-100 flex-shrink-0">
                <span className="text-xs font-bold text-indigo-400 uppercase">Jun</span>
                <span className="text-xl font-black text-indigo-700">12</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">Cardiology Consult</h4>
                <p className="text-sm text-gray-500 font-medium mb-2">Dr. Sarah Jenkins</p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 w-max px-2.5 py-1 rounded-md">
                  <Clock size={12} /> 10:30 AM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 px-1">Recent Updates</h3>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button 
            onClick={() => navigate('/portal/records')}
            className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <Activity size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-sm">Comprehensive Blood Panel</p>
                <p className="text-xs text-gray-500">Results available • Jun 01</p>
              </div>
            </div>
            <ChevronRight className="text-gray-400" size={18} />
          </button>
          
          <button 
            onClick={() => navigate('/portal/records')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-sm">Discharge Summary</p>
                <p className="text-xs text-gray-500">Dr. Michael Chen • May 15</p>
              </div>
            </div>
            <ChevronRight className="text-gray-400" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
