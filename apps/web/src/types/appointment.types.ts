export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  appointmentDate: string;
  timeSlot: string;
  type: 'NEW' | 'FOLLOW_UP' | 'TELEMEDICINE';
  status: 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason: string;
  notes?: string;
  tokenNumber?: number;
  createdAt: string;
}
