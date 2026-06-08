import React, { useState } from 'react';
import { useGetAppointmentsQuery, useUpdateAppointmentStatusMutation } from '../api/appointmentApi';
import { LoadingSpinner, StatusBadge, Button, Input } from '../../../components/ui';
import type { SharedAppointment, SharedPatient, SharedDoctor } from '@medicalink/shared';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Search, Calendar as CalendarIcon, Clock, Plus, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const AppointmentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const { data: response, isLoading } = useGetAppointmentsQuery(dateFilter ? { date: dateFilter } : {});
  const [updateStatus, { isLoading: isUpdating }] = useUpdateAppointmentStatusMutation();

  if (isLoading) {
    return <LoadingSpinner text="Loading appointments..." />;
  }

  const appointments: SharedAppointment[] = response?.data || [];

  const filteredAppointments = appointments.filter(app => {
    const searchString = `${(app.patient as SharedPatient)?.firstName} ${(app.patient as SharedPatient)?.lastName} ${app.appointmentNumber} ${((app.doctor as SharedDoctor)?.userId as any)?.lastName}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Appointment status updated to ${status}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage all hospital appointments</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/appointments/calendar">
            <Button variant="outline"><CalendarIcon className="w-4 h-4 mr-2" /> Calendar</Button>
          </Link>
          <Link to="/appointments/reception">
            <Button variant="outline"><LayoutDashboard className="w-4 h-4 mr-2" /> Reception Desk</Button>
          </Link>
          <Link to="/appointments/book">
            <Button><Plus className="w-4 h-4 mr-2" /> Book New</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search patient, token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <div className="relative">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Token / ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No appointments found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">#{app.tokenNumber}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{app.appointmentNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-700">
                        <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                        {format(new Date(app.appointmentDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-slate-500 mt-1">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        {app.timeSlot.start} - {app.timeSlot.end}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {(app.patient as SharedPatient)?.firstName} {(app.patient as SharedPatient)?.lastName}
                      </div>
                      <div className="text-slate-500 text-xs">
                        UHID: {(app.patient as SharedPatient)?.uhid}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      Dr. {((app.doctor as SharedDoctor)?.userId as any)?.lastName}
                    </td>
                    <td className="px-6 py-4">
                    <StatusBadge variant={
                      app.status === 'COMPLETED' ? 'success' :
                      app.status === 'CANCELLED' ? 'destructive' :
                      app.status === 'IN_CONSULTATION' ? 'warning' : 'default'
                    }>
                      {app.status.replace('_', ' ')}
                    </StatusBadge>
                  </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === 'SCHEDULED' || app.status === 'CONFIRMED' ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() => handleStatusChange(app._id!, 'CHECKED_IN')}
                              disabled={isUpdating}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Check In
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatusChange(app._id!, 'CANCELLED')}
                              disabled={isUpdating}
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                          </>
                        ) : app.status === 'CHECKED_IN' ? (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleStatusChange(app._id!, 'IN_CONSULTATION')}
                            disabled={isUpdating}
                          >
                            Start Consult
                          </Button>
                        ) : app.status === 'IN_CONSULTATION' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            onClick={() => handleStatusChange(app._id!, 'COMPLETED')}
                            disabled={isUpdating}
                          >
                            Complete
                          </Button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
