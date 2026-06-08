import React from 'react';
import { FileText, Download, Activity, FileStack } from 'lucide-react';

export const PortalRecords: React.FC = () => {
  const records = [
    {
      id: 1,
      title: 'Comprehensive Blood Panel',
      date: 'Jun 01, 2026',
      doctor: 'Dr. Sarah Jenkins',
      type: 'LAB',
      status: 'AVAILABLE'
    },
    {
      id: 2,
      title: 'Discharge Summary',
      date: 'May 15, 2026',
      doctor: 'Dr. Michael Chen',
      type: 'CLINICAL_NOTE',
      status: 'AVAILABLE'
    },
    {
      id: 3,
      title: 'Chest X-Ray Report',
      date: 'May 14, 2026',
      doctor: 'Imaging Dept',
      type: 'RADIOLOGY',
      status: 'AVAILABLE'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'LAB': return <Activity size={24} className="text-green-600" />;
      case 'RADIOLOGY': return <FileStack size={24} className="text-purple-600" />;
      default: return <FileText size={24} className="text-blue-600" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'LAB': return 'bg-green-100';
      case 'RADIOLOGY': return 'bg-purple-100';
      default: return 'bg-blue-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">My Records</h2>
          <p className="text-sm text-gray-500">View and download your medical history</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-full whitespace-nowrap shadow-sm">
          All Records
        </button>
        <button className="px-4 py-1.5 bg-white text-gray-600 text-sm font-medium rounded-full border border-gray-200 whitespace-nowrap shadow-sm">
          Lab Results
        </button>
        <button className="px-4 py-1.5 bg-white text-gray-600 text-sm font-medium rounded-full border border-gray-200 whitespace-nowrap shadow-sm">
          Clinical Notes
        </button>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getBg(record.type)}`}>
                {getIcon(record.type)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-0.5">{record.title}</h3>
                <p className="text-xs text-gray-500">{record.doctor} • {record.date}</p>
              </div>
            </div>
            
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-colors">
              <Download size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
