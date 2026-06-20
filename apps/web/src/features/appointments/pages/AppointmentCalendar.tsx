import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useGetAppointmentsQuery } from '../api/appointmentApi';
import { LoadingSpinner, Button } from '../../../components/ui';
import type { SharedAppointment, SharedPatient, SharedDoctor, SharedUser } from '@medicalink/shared';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface CalendarEvent {
  id: string | undefined;
  title: string;
  start: Date;
  end: Date;
  resource: SharedAppointment;
}

export const AppointmentCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: response, isLoading } = useGetAppointmentsQuery({});

  if (isLoading) {
    return <LoadingSpinner text="Loading calendar..." />;
  }

  const appointments: SharedAppointment[] = response?.data || [];

  const events: CalendarEvent[] = appointments.map(app => {
    const [startHour, startMin] = app.timeSlot.start.split(':').map(Number);
    const [endHour, endMin] = app.timeSlot.end.split(':').map(Number);

    const startDate = new Date(app.appointmentDate);
    startDate.setHours(startHour, startMin, 0, 0);

    const endDate = new Date(app.appointmentDate);
    endDate.setHours(endHour, endMin, 0, 0);

    const patient = app.patient as SharedPatient;
    const doctor = app.doctor as SharedDoctor;
    // userId is populated from the backend as a User document
    const doctorUser = doctor?.userId as unknown as SharedUser;
    const doctorName = doctorUser ? `Dr. ${doctorUser.lastName}` : '';

    return {
      id: app._id,
      title: `${patient?.firstName} ${patient?.lastName} — ${doctorName}`,
      start: startDate,
      end: endDate,
      resource: app,
    };
  });

  const eventStyleGetter = (event: CalendarEvent) => {
    const app = event.resource;
    let backgroundColor = '#3174ad';

    switch (app.status) {
      case 'CHECKED_IN':       backgroundColor = '#f59e0b'; break;
      case 'IN_CONSULTATION':  backgroundColor = '#10b981'; break;
      case 'COMPLETED':        backgroundColor = '#6b7280'; break;
      case 'CANCELLED':
      case 'NO_SHOW':          backgroundColor = '#ef4444'; break;
      default: break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        cursor: 'pointer',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.id) {
      navigate(`/appointments/${event.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Appointment Calendar</h1>
          <p className="text-slate-500 mt-1">Click any appointment to view full details</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/appointments')}>
          Back to List
        </Button>
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
          onSelectEvent={handleSelectEvent}
        />
      </div>
    </div>
  );
};
