export enum TeleconsultationStatus {
  WAITING = "WAITING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  MISSED = "MISSED",
  CANCELLED = "CANCELLED"
}

export interface ITeleconsultationSession {
  _id: string;
  tenantId: string;
  appointment?: any; // IAppointment ref
  patient: {
    userId: string;
    name: string;
    token?: string;
  };
  doctor: {
    userId: string;
    name: string;
  };
  scheduledAt: string;
  actualStartAt?: string;
  actualEndAt?: string;
  duration?: number; // minutes
  techStats?: {
    quality?: string;
    issues?: string;
  };
  consultation?: any; // IConsultation ref
  recordingUrl?: string;
  status: TeleconsultationStatus;
  createdAt: string;
  updatedAt: string;
}
