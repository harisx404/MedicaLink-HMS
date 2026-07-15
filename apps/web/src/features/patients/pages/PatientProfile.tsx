import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetPatientByIdQuery } from '../api/patientApi';
import { UHIDDisplay } from '../components/UHIDDisplay';
import { AllergyBadge } from '../components/AllergyBadge';
import { PatientPortalCard } from '../components/PatientPortalCard';
import { AIClinicalSummary } from '../components/AIClinicalSummary';
import { PatientRiskCard } from '../components/PatientRiskCard';
import { LabTrendsSummarizer } from '../components/LabTrendsSummarizer';
import { VisitTimeline } from '../components/VisitTimeline';
import { InsuranceCard } from '../components/InsuranceCard';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Loader2, ArrowLeft, Edit, Calendar, FileText, Activity, CreditCard, User, Pill, FolderOpen, ClipboardList } from 'lucide-react';
import { formatPatientAge } from '../../../utils/ageUtils';

type TabType = 'overview' | 'visits' | 'medical' | 'prescriptions' | 'financial' | 'documents';

export const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data, isLoading, error } = useGetPatientByIdQuery(id as string, { skip: !id });
  const patient = data?.data?.patient;

  if (isLoading) {
    return (
      <PageWrapper title="Loading Patient">
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-500 font-medium">Fetching patient record...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !patient) {
    return (
      <PageWrapper title="Patient Not Found">
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm mt-6">
          <User className="text-gray-300 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
          <p className="text-gray-500 mb-6">The patient record you are looking for does not exist or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate('/patients')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all"
          >
            Return to Directory
          </button>
        </div>
      </PageWrapper>
    );
  }

  const age = formatPatientAge(patient.dateOfBirth);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'visits', label: 'Visit History', icon: ClipboardList },
    { id: 'medical', label: 'Medical Records', icon: Activity },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'financial', label: 'Financial', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
  ] as const;

  return (
    <PageWrapper title={`Patient: ${patient.firstName} ${patient.lastName}`}>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              window.open(`http://localhost:5000/api/v1/fhir/Patient/${patient._id}/$everything`, '_blank');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm"
            title="Download Medical Record as FHIR R4 JSON"
          >
            <Activity size={16} /> Export as FHIR
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Edit size={16} /> Edit Profile
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <Calendar size={16} /> New Appointment
          </button>
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="-mt-16 w-32 h-32 rounded-2xl bg-white p-1.5 shadow-md flex-shrink-0">
              <div className="w-full h-full rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 overflow-hidden">
                {patient.photo ? (
                  <img src={patient.photo} alt={patient.firstName} className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="opacity-50" />
                )}
              </div>
            </div>

            {/* Core Info */}
            <div className="flex-1 pt-4 w-full">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {patient.firstName} {patient.middleName ? `${patient.middleName} ` : ''}{patient.lastName}
                  </h1>
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <UHIDDisplay uhid={patient.uhid} size="md" copyable />
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${patient.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {patient.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold tracking-wide uppercase">
                      {patient.registrationType}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    {patient.gender} • {age} old • Blood: {patient.bloodGroup} • {patient.maritalStatus}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-w-[250px]">
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Contact</p>
                    <p className="text-sm font-medium text-gray-800">{patient.phone}</p>
                    {patient.email && <p className="text-sm text-gray-600">{patient.email}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm text-gray-600 truncate">{patient.address.city}, {patient.address.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-t border-gray-100 px-4 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-all border-b-2 outline-none ${
                  isActive 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="mb-20">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* AI Clinical Summary */}
              <AIClinicalSummary patient={patient} />
              
              {/* AI Patient Risk Card */}
              <PatientRiskCard patient={patient} />

              {/* Emergency Contact */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-red-500" /> Emergency Contact
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{patient.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Relationship</p>
                    <p className="font-medium text-gray-900">{patient.emergencyContact.relationship}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{patient.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>

              {/* Full Address */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Residential Address</h3>
                <p className="text-gray-700">{patient.address.street}</p>
                <p className="text-gray-700">{patient.address.city}, {patient.address.state}</p>
                <p className="text-gray-700">{patient.address.pincode}, {patient.address.country}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Quick Medical Summary */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Critical Alerts</h3>
                {patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {patient.allergies.map((allergy, idx) => (
                      <AllergyBadge key={idx} allergy={allergy} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4 italic">No known allergies.</p>
                )}
                
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Chronic Conditions</h3>
                {patient.chronicConditions.length > 0 ? (
                  <ul className="space-y-2">
                    {patient.chronicConditions.map((cond, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                        {cond.condition} <span className="text-xs text-gray-400">({cond.status})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No chronic conditions.</p>
                )}
              </div>

              {/* Patient Portal Card */}
              <PatientPortalCard patient={patient} />
            </div>
          </div>
        )}

        {activeTab === 'visits' && (
          <VisitTimeline patient={patient} />
        )}

        {activeTab === 'medical' && (
          <div className="space-y-6">
            <LabTrendsSummarizer />
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <Activity className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Medical Records</h3>
              <p className="text-gray-500 max-w-md mx-auto">This section will contain detailed clinical notes, laboratory results, and vital signs.</p>
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <Pill className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Prescriptions</h3>
            <p className="text-gray-500 max-w-md mx-auto">All historical prescriptions and current medications will be listed here.</p>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <CreditCard className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Financial & Billing</h3>
              <p className="text-gray-500 max-w-md mx-auto">This section will contain active insurances, TPA details, and historical invoices.</p>
            </div>
            
            {patient.insurances && patient.insurances.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Active Insurances</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patient.insurances.map((ins, idx) => (
                    <InsuranceCard key={idx} insurance={ins} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <FolderOpen className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Document Gallery</h3>
            <p className="text-gray-500 max-w-md mx-auto">Upload and view scanned ID cards, consent forms, and medical reports.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
