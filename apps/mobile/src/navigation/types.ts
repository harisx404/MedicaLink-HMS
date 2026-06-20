/**
 * Central navigation type definitions.
 * Import these throughout the app to eliminate all `as any` navigation casts.
 */

export type AuthStackParamList = {
  TenantEntry: undefined;
  Login: { tenantSlug?: string } | undefined;
  TwoFactor: { userId: string };
};

// ── Patient ─────────────────────────────────────────────────────────────────

export type PatientTabParamList = {
  Home: undefined;
  Appointments: undefined;
  Records: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  PatientHomeTab: undefined;
};

export type AppointmentsStackParamList = {
  AppointmentListTab: undefined;
  SpecialtySelect: undefined;
  DoctorSelect: { specialtyId: string; specialtyName: string };
  DateSelect: { specialtyId: string; specialtyName: string; doctorId: string; doctorName: string };
  SlotSelect: { specialtyId: string; specialtyName: string; doctorId: string; doctorName: string; date: string; consultationFee: number };
  ConfirmBooking: { doctorId: string; doctorName: string; date: string; slot: string; consultationFee: number };
  BookingSuccess: { doctorName: string; date: string; slot: string };
};

// ── Doctor ───────────────────────────────────────────────────────────────────

export type DoctorTabParamList = {
  Today: undefined;
  Patients: undefined;
  Profile: undefined;
};

export type DoctorPatientStackParamList = {
  PatientsListTab: undefined;
  PatientDetail: { patientId: string; patientName: string };
};

// ── Nurse ────────────────────────────────────────────────────────────────────

export type NurseTabParamList = {
  Ward: undefined;
  Tasks: undefined;
  Profile: undefined;
};

export type WardStackParamList = {
  WardOverviewTab: undefined;
  VitalsEntry: { patientId: string; patientName: string };
};

// ── Root ─────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  TenantEntry: undefined;
  Login: { tenantSlug?: string } | undefined;
  TwoFactor: { userId: string };
  PatientApp: undefined;
  DoctorApp: undefined;
  NurseApp: undefined;
};
