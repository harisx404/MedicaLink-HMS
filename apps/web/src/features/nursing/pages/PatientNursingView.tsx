import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetPatientByIdQuery } from '../../patients/api/patientApi';
import { useGetPatientVitalsQuery, useGetPatientMARQuery } from '../nursingApi';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { VitalsChart } from '../components/VitalsChart';
import { MARTable } from '../components/MARTable';
import { Activity, Pill, ClipboardList, ArrowLeft, Heart, Thermometer, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PatientNursingView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'vitals' | 'mar' | 'notes'>('vitals');
  
  const { data: patientData, isLoading: patientLoading } = useGetPatientByIdQuery(id || '');
  const { data: vitalsData, isLoading: vitalsLoading } = useGetPatientVitalsQuery(id || '');
  const { data: marData, isLoading: marLoading } = useGetPatientMARQuery(id || '');
  
  const patient = patientData?.data?.patient;
  const vitals = vitalsData?.data || [];
  const latestVitals = vitals.length > 0 ? vitals[0] : null;

  if (patientLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  const tabs = [
    { id: 'vitals', label: 'Vitals & Charting', icon: Activity },
    { id: 'mar', label: 'MAR (Medications)', icon: Pill },
    { id: 'notes', label: 'Nursing Notes', icon: ClipboardList },
  ];

  return (
    <PageWrapper title={`${patient.firstName} ${patient.lastName}`}>
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex items-center space-x-4 mb-4">
          <Link to="/nursing" className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-gray-500">UHID: {patient.uhid} | Ward A / Bed 12 | Admitted: 2 days ago</span>
        </div>

      {/* Latest Vitals Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-wrap gap-6 items-center">
        <div className="flex-1 min-w-[200px]">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Latest Vitals</h3>
          {latestVitals ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Heart className="w-5 h-5" /></div>
                <div><p className="text-xs text-gray-500">Heart Rate</p><p className="font-semibold">{latestVitals.pulse || '--'} bpm</p></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Activity className="w-5 h-5" /></div>
                <div><p className="text-xs text-gray-500">BP</p><p className="font-semibold">{latestVitals.bp?.systolic || '--'}/{latestVitals.bp?.diastolic || '--'}</p></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Thermometer className="w-5 h-5" /></div>
                <div><p className="text-xs text-gray-500">Temp</p><p className="font-semibold">{latestVitals.temp || '--'} °C</p></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-50 text-teal-500 rounded-lg"><Droplets className="w-5 h-5" /></div>
                <div><p className="text-xs text-gray-500">SpO2</p><p className="font-semibold">{latestVitals.spO2 || '--'} %</p></div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">No vitals recorded yet.</p>
          )}
        </div>
        
        {latestVitals?.newsScore !== undefined && (
          <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-6 min-w-[150px]">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">NEWS Score</span>
            <span className={`text-4xl font-bold font-jakarta ${
              latestVitals.newsScore >= 7 ? 'text-red-600' : 
              latestVitals.newsScore >= 5 ? 'text-amber-500' : 'text-teal-500'
            }`}>
              {latestVitals.newsScore}
            </span>
            <span className="text-xs mt-1 text-gray-500">
              {latestVitals.newsScore >= 7 ? 'High Risk' : latestVitals.newsScore >= 5 ? 'Medium Risk' : 'Low Risk'}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'vitals' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    + Record New Vitals
                  </button>
                </div>
                {vitalsLoading ? (
                  <div className="h-64 bg-gray-50 animate-pulse rounded-xl"></div>
                ) : (
                  <VitalsChart data={vitals} />
                )}
              </div>
            )}

            {activeTab === 'mar' && (
              <div className="space-y-6">
                {marLoading ? (
                  <div className="h-64 bg-gray-50 animate-pulse rounded-xl"></div>
                ) : (
                  <MARTable 
                    patientId={id || ''} 
                    prescriptions={marData?.data?.prescriptions || []} 
                    history={marData?.data?.history || []} 
                  />
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nursing Notes</h3>
                <p className="text-gray-500 mb-6">Shift documentation and handover notes appear here.</p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                  Add Note
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </PageWrapper>
  );
};
