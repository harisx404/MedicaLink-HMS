import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetDoctorByIdQuery } from '../api/doctorApi';
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from '../../../components/ui';
import { RatingStars } from '../components/RatingStars';
import { AvailabilityStatus } from '../components/AvailabilityStatus';
import { User, Mail, Phone, Calendar, Clock, FileText, Award, BarChart3, Users, Settings } from 'lucide-react';

export const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetDoctorByIdQuery(id as string, {
    skip: !id,
  });

  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return <div className="p-8 animate-pulse text-center text-slate-500">Loading doctor profile...</div>;
  }

  if (isError || !data?.data?.doctor) {
    return <div className="p-8 text-center text-red-500">Failed to load profile.</div>;
  }

  const doctor = data.data.doctor;
  const primarySpecialty = doctor.specializations.find(s => s.isPrimary) || doctor.specializations[0];

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 -mt-16 mb-4">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-md">
                <div className="w-full h-full rounded-xl bg-slate-100 overflow-hidden">
                  {doctor.photo || doctor.user?.profileImage ? (
                    <img
                      src={doctor.photo || doctor.user?.profileImage}
                      alt="Doctor"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-300">
                      <User size={48} />
                    </div>
                  )}
                </div>
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900">
                    Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                  </h1>
                  <AvailabilityStatus status={doctor.currentStatus} />
                </div>
                <p className="text-slate-500 flex items-center gap-2">
                  {doctor.qualifications.map(q => q.degree).join(', ')} 
                  <span className="text-slate-300">•</span>
                  {primarySpecialty?.specialty}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <RatingStars rating={doctor.avgRating} count={doctor.totalRatings} />
                  <span className="text-sm text-slate-500">{doctor.experience} Years Experience</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
              <Link to={`/doctors/${doctor.id}/schedule`}>
                 <Button variant="outline" className="gap-2 w-full md:w-auto">
                   <Settings size={16} /> Manage Schedule
                 </Button>
              </Link>
              <Button variant="primary" className="gap-2 w-full md:w-auto">
                <Calendar size={16} /> Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border-b border-slate-200 rounded-none w-full justify-start p-0 h-auto overflow-x-auto">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none py-4 px-6 bg-transparent">
            Overview
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none py-4 px-6 bg-transparent">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="patients" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none py-4 px-6 bg-transparent">
            Patients
          </TabsTrigger>
          <TabsTrigger value="statistics" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none py-4 px-6 bg-transparent">
            Statistics
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Biography */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                     <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                       <FileText size={20} className="text-indigo-500"/> About
                     </h3>
                     <p className="text-slate-600 leading-relaxed">
                        {doctor.biography || "No biography provided yet."}
                     </p>
                  </div>

                  {/* Qualifications */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                     <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                       <Award size={20} className="text-indigo-500"/> Education & Qualifications
                     </h3>
                     <div className="space-y-4">
                        {doctor.qualifications.map((q, i) => (
                           <div key={i} className="flex gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                              <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                 <Award size={20} />
                              </div>
                              <div>
                                 <p className="font-semibold text-slate-900">{q.degree}</p>
                                 <p className="text-sm text-slate-500">{q.institution}</p>
                                 <p className="text-xs text-slate-400 mt-1">{q.year}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                   {/* Contact Info */}
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                     <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact</h3>
                     <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-600">
                           <Mail size={16} className="text-slate-400" />
                           <span className="text-sm">{doctor.user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                           <Phone size={16} className="text-slate-400" />
                           <span className="text-sm">N/A</span>
                        </div>
                     </div>
                   </div>

                   {/* Fees */}
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                     <h3 className="text-lg font-semibold text-slate-900 mb-4">Consultation Fees</h3>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500">OPD</span>
                           <span className="font-medium text-slate-900">${doctor.consultationFee.opd}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500">Telemedicine</span>
                           <span className="font-medium text-slate-900">${doctor.consultationFee.telemedicine}</span>
                        </div>
                     </div>
                   </div>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-semibold text-slate-900">Weekly Schedule</h3>
                 <Link to={`/doctors/${doctor.id}/schedule`}>
                    <Button variant="outline" size="sm">Edit Schedule</Button>
                 </Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {doctor.weeklySchedule.map((day, idx) => (
                     <div key={idx} className={`p-4 rounded-xl border ${day.isWorking ? 'border-indigo-100 bg-indigo-50/50' : 'border-slate-100 bg-slate-50'}`}>
                        <h4 className="font-semibold text-slate-900 mb-3">{day.day}</h4>
                        {!day.isWorking ? (
                           <p className="text-sm text-slate-400">Day Off</p>
                        ) : day.shifts.length === 0 ? (
                           <p className="text-sm text-slate-400">No shifts defined</p>
                        ) : (
                           <div className="space-y-2">
                              {day.shifts.map((s, i) => (
                                 <div key={i} className="text-sm flex items-center justify-between bg-white p-2 rounded border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2">
                                       <Clock size={14} className="text-indigo-400" />
                                       <span className="text-slate-700">{s.startTime} - {s.endTime}</span>
                                    </div>
                                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                       {s.type}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="patients">
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
                <Users size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Patient Directory</h3>
                <p className="text-slate-500 max-w-sm mt-2">
                   This module integrates with the unified patient records to display patients specific to Dr. {doctor.user?.lastName}.
                </p>
             </div>
          </TabsContent>

          <TabsContent value="statistics">
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
                <BarChart3 size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Performance Metrics</h3>
                <p className="text-slate-500 max-w-sm mt-2">
                   Consultation statistics and revenue charts will be aggregated here.
                </p>
             </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
