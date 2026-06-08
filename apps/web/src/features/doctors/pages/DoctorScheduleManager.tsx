/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetDoctorByIdQuery, useUpdateScheduleMutation } from '../api/doctorApi';
import { ScheduleGrid } from '../components/ScheduleGrid';
import type { DailySchedule } from '@medicalink/shared';
import { Button } from '../../../components/ui';
import { Save, ArrowLeft, CalendarDays } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const DoctorScheduleManager: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data, isLoading } = useGetDoctorByIdQuery(id as string, { skip: !id });
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateScheduleMutation();

  const [schedule, setSchedule] = useState<DailySchedule[]>([]);

  useEffect(() => {
    if (data?.data?.doctor?.weeklySchedule) {
      setSchedule(data.data.doctor.weeklySchedule);
    }
  }, [data]);

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateSchedule({ id, weeklySchedule: schedule }).unwrap();
      toast.success('Schedule updated successfully');
      navigate(`/doctors/${id}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update schedule');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading schedule...</div>;
  }

  const doctor = data?.data?.doctor;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/doctors/${id}`)}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays size={24} className="text-indigo-600" />
              Schedule Builder
            </h1>
            <p className="text-slate-500 mt-1">
               Dr. {doctor?.user?.firstName} {doctor?.user?.lastName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/doctors/${id}`)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            className="gap-2" 
            onClick={handleSave}
            disabled={isUpdating}
          >
            <Save size={18} />
            {isUpdating ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Weekly Template</h2>
          <p className="text-slate-500 text-sm">
            Define the default working hours and shift slots. This template will be used to generate bookable slots for patients.
          </p>
        </div>

        <ScheduleGrid schedule={schedule} onChange={setSchedule} />
      </div>
    </div>
  );
};
