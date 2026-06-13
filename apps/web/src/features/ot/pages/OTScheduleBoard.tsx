import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTheatersQuery, useGetCasesQuery } from '../api/otApi';
import { Plus, Clock, Search, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react';
import { OTCaseStatus } from '@medicalink/shared';

export const OTScheduleBoard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { data: theatersData, isLoading: isLoadingTheaters } = useGetTheatersQuery();
  const { data: casesData, isLoading: isLoadingCases, refetch } = useGetCasesQuery({ date: selectedDate });
  
  const theaters = theatersData?.data || [];
  const cases = casesData?.data || [];

  // Poll or socket could be added here, currently just simple refetch interval or rely on RTK query cache invalidation via sockets
  useEffect(() => {
    refetch();
  }, [selectedDate, refetch]);

  const getStatusColor = (status: OTCaseStatus) => {
    switch(status) {
      case OTCaseStatus.SCHEDULED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case OTCaseStatus.IN_PREP: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case OTCaseStatus.IN_PROGRESS: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case OTCaseStatus.COMPLETED: return 'bg-slate-100 text-slate-700 border-slate-200';
      case OTCaseStatus.CANCELLED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Build timeline: 08:00 to 20:00 (12 hours) -> 720 minutes
  const START_HOUR = 8;
  const END_HOUR = 20;
  const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

  const renderTimeline = () => {
    const hours = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      hours.push(h);
    }

    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Timeline Header */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <div className="w-48 flex-shrink-0 p-4 font-semibold text-slate-700 border-r border-slate-200 flex items-center">
            Theater
          </div>
          <div className="flex-1 relative flex">
            {hours.map(hour => (
              <div key={hour} className="flex-1 border-r border-slate-200 p-2 text-xs font-medium text-slate-500 text-center relative">
                {hour}:00
                {hour !== END_HOUR && <div className="absolute top-full left-1/2 w-px h-[1000px] bg-slate-100 -translate-x-1/2 z-0"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Body */}
        <div className="divide-y divide-slate-100 relative z-10">
          {isLoadingTheaters || isLoadingCases ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading Operation Theaters...</div>
          ) : theaters.length === 0 ? (
             <div className="p-12 text-center text-slate-500">No theaters configured.</div>
          ) : theaters.map((theater) => {
            const theaterCases = cases.filter(c => c.theater?._id === theater._id);

            return (
              <div key={theater._id} className="flex bg-white group hover:bg-slate-50 transition-colors min-h-[80px]">
                <div className="w-48 flex-shrink-0 p-4 border-r border-slate-200 flex flex-col justify-center">
                  <span className="font-bold text-slate-800">{theater.name}</span>
                  <span className="text-xs text-slate-500">{theater.type} • {theater.status}</span>
                </div>
                
                <div className="flex-1 relative py-2 px-1">
                  {theaterCases.map((otCase) => {
                    const timeParts = otCase.scheduledTime.split(':');
                    const caseHour = parseInt(timeParts[0], 10);
                    const caseMin = parseInt(timeParts[1], 10);
                    
                    // Calculate position and width percentage
                    const startMin = ((caseHour - START_HOUR) * 60) + caseMin;
                    const duration = otCase.estimatedDuration || 60;
                    
                    const leftPct = Math.max(0, (startMin / TOTAL_MINUTES) * 100);
                    const widthPct = Math.min(100 - leftPct, (duration / TOTAL_MINUTES) * 100);

                    // Don't render if outside our visible window completely
                    if (leftPct >= 100) return null;

                    return (
                      <div 
                        key={otCase._id}
                        onClick={() => navigate(`/ot/cases/${otCase._id}`)}
                        className={`absolute top-2 bottom-2 rounded-lg border shadow-sm p-2 cursor-pointer transition-all hover:shadow-md hover:z-20 overflow-hidden ${getStatusColor(otCase.status)}`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      >
                        <div className="font-bold text-xs truncate leading-tight mb-1">
                          {otCase.procedure?.name}
                        </div>
                        <div className="text-[10px] truncate opacity-90 font-medium flex items-center">
                          <UserIcon size={10} className="mr-1" />
                          {otCase.patient?.firstName} {otCase.patient?.lastName}
                        </div>
                        <div className="text-[10px] truncate opacity-80 mt-1">
                          {otCase.scheduledTime} ({duration}m)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">OT Schedule Board</h1>
          <p className="text-slate-500 text-sm mt-1">Manage operation theater utilization and surgical cases.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search surgeon or patient..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
            />
          </div>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 font-medium"
            />
          </div>
          <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
            <Plus size={18} className="mr-2" /> Schedule Case
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled Cases', value: cases.filter(c => c.status === OTCaseStatus.SCHEDULED).length, color: 'blue' },
          { label: 'In Progress', value: cases.filter(c => c.status === OTCaseStatus.IN_PROGRESS).length, color: 'emerald' },
          { label: 'Completed Today', value: cases.filter(c => c.status === OTCaseStatus.COMPLETED).length, color: 'slate' },
          { label: 'Utilization', value: '78%', color: 'indigo' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-full bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
              <Clock size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Board */}
      <div className="mt-8 overflow-x-auto pb-4">
        <div className="min-w-[1000px]">
          {renderTimeline()}
        </div>
      </div>
    </div>
  );
};
