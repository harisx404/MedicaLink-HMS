import React from 'react';
import { Calendar, Clock, Stethoscope, FileText, ChevronRight } from 'lucide-react';
import type { SharedPatient } from '@medicalink/shared';

interface VisitTimelineProps {
  patient: SharedPatient;
}

export const VisitTimeline: React.FC<VisitTimelineProps> = ({ patient }) => {
  // Placeholder data - in a real app this would come from an API endpoint like /patients/:id/visits
  const mockVisits = [
    {
      id: 'v1',
      date: '2026-06-01',
      time: '10:30 AM',
      doctor: 'Dr. Sarah Jenkins',
      department: 'Cardiology',
      type: 'Follow-up',
      status: 'COMPLETED',
      diagnosis: 'Hypertension stable. Continued current medication.',
    },
    {
      id: 'v2',
      date: '2026-05-15',
      time: '02:15 PM',
      doctor: 'Dr. Michael Chen',
      department: 'General Medicine',
      type: 'Initial Consultation',
      status: 'COMPLETED',
      diagnosis: 'Patient reported chest pain and shortness of breath. Ordered ECG and full blood panel.',
    }
  ];

  if (mockVisits.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Visit History</h3>
        <p className="text-gray-500">This patient hasn't had any recorded visits yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800">Visit Timeline for {patient.firstName}</h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
          Filter Visits
        </button>
      </div>
      <div className="p-6">
        <div className="relative border-l-2 border-blue-100 ml-3 space-y-8">
          {mockVisits.map((visit) => (
            <div key={visit.id} className="relative pl-8">
              {/* Timeline dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
              
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:border-blue-200 transition-colors group cursor-pointer">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold tracking-wide uppercase">
                        {visit.type}
                      </span>
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                        <Clock size={14} /> {visit.date} at {visit.time}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2 mt-2">
                      <Stethoscope size={18} className="text-gray-400" />
                      {visit.doctor}
                    </h4>
                    <p className="text-sm text-gray-500">{visit.department}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <FileText size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors sm:hidden group-hover:flex">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Diagnosis/Notes:</span> {visit.diagnosis}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
