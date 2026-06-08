import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useGetAppointmentsQuery } from '../api/appointmentApi';
import { LoadingSpinner, Button } from '../../../components/ui';
import type { SharedAppointment, SharedPatient, SharedDoctor } from '@medicalink/shared';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const AppointmentCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Load a month's worth of appointments based on current view
  const { data: response, isLoading } = useGetAppointmentsQuery({});

  if (isLoading) {
    return <LoadingSpinner text="Loading calendar..." />;
  }

  const appointments: SharedAppointment[] = response?.data || [];

  const events = appointments.map(app => {
    // timeSlot.start is "HH:mm"
    const [startHour, startMin] = app.timeSlot.start.split(':').map(Number);
    const [endHour, endMin] = app.timeSlot.end.split(':').map(Number);
    
    const startDate = new Date(app.appointmentDate);
    startDate.setHours(startHour, startMin, 0, 0);

    const endDate = new Date(app.appointmentDate);
    endDate.setHours(endHour, endMin, 0, 0);

    return {
      id: app._id,
      title: `${(app.patient as SharedPatient)?.firstName} ${(app.patient as SharedPatient)?.lastName} - Dr. ${((app.doctor as SharedDoctor)?.userId as any)?.lastName || ''}`,
      start: startDate,
      end: endDate,
      resource: app,
    };
  });

  const eventStyleGetter = (event: any) => {
    const app: SharedAppointment = event.resource;
    let backgroundColor = '#3174ad';
    
    switch (app.status) {
      case 'CHECKED_IN':
        backgroundColor = '#f59e0b'; // amber
        break;
      case 'IN_CONSULTATION':
        backgroundColor = '#10b981'; // green
        break;
      case 'COMPLETED':
        backgroundColor = '#6b7280'; // gray
        break;
      case 'CANCELLED':
      case 'NO_SHOW':
        backgroundColor = '#ef4444'; // red
        break;
      default:
        break; // scheduled/confirmed
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Appointment Calendar</h1>
          <p className="text-slate-500 mt-1">Manage and view hospital schedule</p>
        </div>
        <div>
          <Button variant="outline" onClick={() => window.location.href = '/appointments'}>
            Back to List
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm" style={{ height: '700px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onNavigate={(date) => setCurrentDate(date)}
          date={currentDate}
          views={['month', 'week', 'day', 'agenda']}
          onSelectEvent={(event) => {
            // Future: Open modal with details
            console.log(event);
          }}
        />
      </div>
    </div>
  );
};
