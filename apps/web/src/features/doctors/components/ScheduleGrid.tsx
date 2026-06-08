import React from 'react';
import type { DailySchedule, Shift } from '@medicalink/shared';
import { Plus, Trash2, Clock, Users } from 'lucide-react';
import { Button, Input } from '../../../components/ui';

interface ScheduleGridProps {
  schedule: DailySchedule[];
  onChange: (schedule: DailySchedule[]) => void;
}

const DEFAULT_SHIFT: Shift = {
  startTime: '09:00',
  endTime: '13:00',
  appointmentDuration: 15,
  maxPatients: 16,
  type: 'OPD',
};

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ schedule, onChange }) => {
  // Ensure all days exist
  const normalizedSchedule = DAYS.map(day => {
    const existing = schedule.find(s => s.day === day);
    return existing || { day, isWorking: false, shifts: [] };
  });

  const toggleDayWorking = (dayIndex: number) => {
    const newSchedule = [...normalizedSchedule];
    newSchedule[dayIndex] = {
      ...newSchedule[dayIndex],
      isWorking: !newSchedule[dayIndex].isWorking,
      shifts: !newSchedule[dayIndex].isWorking && newSchedule[dayIndex].shifts.length === 0 
        ? [{ ...DEFAULT_SHIFT }] 
        : newSchedule[dayIndex].shifts
    };
    onChange(newSchedule);
  };

  const addShift = (dayIndex: number) => {
    const newSchedule = [...normalizedSchedule];
    newSchedule[dayIndex] = {
      ...newSchedule[dayIndex],
      shifts: [...newSchedule[dayIndex].shifts, { ...DEFAULT_SHIFT }]
    };
    onChange(newSchedule);
  };

  const removeShift = (dayIndex: number, shiftIndex: number) => {
    const newSchedule = [...normalizedSchedule];
    const newShifts = [...newSchedule[dayIndex].shifts];
    newShifts.splice(shiftIndex, 1);
    newSchedule[dayIndex] = {
      ...newSchedule[dayIndex],
      shifts: newShifts
    };
    onChange(newSchedule);
  };

  const updateShift = (dayIndex: number, shiftIndex: number, field: keyof Shift, value: any) => {
    const newSchedule = [...normalizedSchedule];
    const newShifts = [...newSchedule[dayIndex].shifts];
    newShifts[shiftIndex] = { ...newShifts[shiftIndex], [field]: value };
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], shifts: newShifts };
    onChange(newSchedule);
  };

  return (
    <div className="space-y-6">
      {normalizedSchedule.map((dayData, dayIndex) => (
        <div 
          key={dayData.day} 
          className={`border rounded-xl p-5 transition-colors ${
            dayData.isWorking ? 'border-indigo-200 bg-indigo-50/30 shadow-sm' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={dayData.isWorking}
                  onChange={() => toggleDayWorking(dayIndex)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
              <h3 className={`font-semibold text-lg ${dayData.isWorking ? 'text-indigo-900' : 'text-slate-500'}`}>
                {dayData.day}
              </h3>
            </div>
            
            {dayData.isWorking && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addShift(dayIndex)}
                className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <Plus size={16} /> Add Shift
              </Button>
            )}
          </div>

          {dayData.isWorking && dayData.shifts.length > 0 && (
            <div className="space-y-3 mt-4">
              {dayData.shifts.map((shift, shiftIndex) => (
                <div key={shiftIndex} className="flex flex-col xl:flex-row gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm items-start xl:items-center relative group">
                  
                  {/* Time Selection */}
                  <div className="flex items-center gap-2 flex-1 w-full">
                    <Clock size={16} className="text-slate-400 flex-shrink-0" />
                    <div className="flex items-center gap-2 w-full">
                      <Input 
                        type="time" 
                        value={shift.startTime} 
                        onChange={(e) => updateShift(dayIndex, shiftIndex, 'startTime', e.target.value)}
                        className="h-9 w-full"
                      />
                      <span className="text-slate-400">to</span>
                      <Input 
                        type="time" 
                        value={shift.endTime} 
                        onChange={(e) => updateShift(dayIndex, shiftIndex, 'endTime', e.target.value)}
                        className="h-9 w-full"
                      />
                    </div>
                  </div>

                  {/* Config */}
                  <div className="flex items-center gap-4 flex-1 w-full justify-between xl:justify-start">
                    <div className="flex items-center gap-2 w-32">
                      <select 
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={shift.appointmentDuration}
                        onChange={(e: any) => updateShift(dayIndex, shiftIndex, 'appointmentDuration', Number(e.target.value))}
                      >
                        <option value={10}>10 min</option>
                        <option value={15}>15 min</option>
                        <option value={20}>20 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 w-32 relative">
                      <Users size={14} className="absolute left-3 text-slate-400" />
                      <Input 
                        type="number" 
                        min="1"
                        value={shift.maxPatients} 
                        onChange={(e: any) => updateShift(dayIndex, shiftIndex, 'maxPatients', Number(e.target.value))}
                        className="h-9 pl-8 w-full"
                        placeholder="Max"
                      />
                    </div>

                    <div className="w-32">
                      <select 
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={shift.type}
                        onChange={(e: any) => updateShift(dayIndex, shiftIndex, 'type', e.target.value)}
                      >
                        <option value="OPD">OPD</option>
                        <option value="IPD">IPD</option>
                        <option value="EMERGENCY">Emergency</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeShift(dayIndex, shiftIndex)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors xl:opacity-0 xl:group-hover:opacity-100 absolute right-2 top-2 xl:relative xl:top-0 xl:right-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {dayData.isWorking && dayData.shifts.length === 0 && (
            <div className="text-center p-6 bg-white border border-slate-200 border-dashed rounded-lg text-slate-500">
              No shifts defined for this day. Click "Add Shift" to begin.
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
