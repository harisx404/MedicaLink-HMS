import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleGuard } from '../components/auth/RoleGuard';
import { SuperAdminLayout } from '../components/layout/SuperAdminLayout';
import { HospitalAdminLayout } from '../components/layout/HospitalAdminLayout';
import { Role } from '@medicalink/shared';
import { StatsCard } from '../components/ui';
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Lazy loaded auth pages
const LoginPage = lazy(() => import('../features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../features/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('../features/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const TwoFactorSetupPage = lazy(() => import('../features/auth/TwoFactorSetupPage').then(m => ({ default: m.TwoFactorSetupPage })));

// Lazy loaded super admin pages
const SuperAdminDashboard = lazy(() => import('../features/super-admin/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const HospitalList = lazy(() => import('../features/super-admin/HospitalList').then(m => ({ default: m.HospitalList })));
const HospitalDetail = lazy(() => import('../features/super-admin/HospitalDetail').then(m => ({ default: m.HospitalDetail })));
const HospitalForm = lazy(() => import('../features/super-admin/HospitalForm').then(m => ({ default: m.HospitalForm })));
const SubscriptionPlans = lazy(() => import('../features/super-admin/SubscriptionPlans').then(m => ({ default: m.SubscriptionPlans })));
const Analytics = lazy(() => import('../features/super-admin/Analytics').then(m => ({ default: m.Analytics })));
const SystemMonitor = lazy(() => import('../features/super-admin/SystemMonitor').then(m => ({ default: m.SystemMonitor })));
const AuditLogs = lazy(() => import('../features/super-admin/AuditLogs').then(m => ({ default: m.AuditLogs })));

// Lazy loaded hospital admin pages
const HospitalSettings = lazy(() => import('../features/hospital-admin/HospitalSettings').then(m => ({ default: m.HospitalSettings })));
const DepartmentList = lazy(() => import('../features/hospital-admin/DepartmentList').then(m => ({ default: m.DepartmentList })));
const StaffList = lazy(() => import('../features/hospital-admin/StaffList').then(m => ({ default: m.StaffList })));
const WardManagement = lazy(() => import('../features/hospital-admin/WardManagement').then(m => ({ default: m.WardManagement })));
const RoleManagement = lazy(() => import('../features/hospital-admin/RoleManagement').then(m => ({ default: m.RoleManagement })));
const HospitalAdminDashboard = lazy(() => import('../features/hospital-admin/HospitalAdminDashboard').then(m => ({ default: m.HospitalAdminDashboard })));

// Lazy loaded patient pages
const PatientRegistrationPage = lazy(() => import('../features/patients/pages/PatientRegistrationPage').then(m => ({ default: m.PatientRegistrationPage })));
const PatientDirectory = lazy(() => import('../features/patients/pages/PatientDirectory').then(m => ({ default: m.PatientDirectory })));
const PatientProfile = lazy(() => import('../features/patients/pages/PatientProfile').then(m => ({ default: m.PatientProfile })));
const PatientPortalLayout = lazy(() => import('../features/patients/components/PatientPortalLayout').then(m => ({ default: m.PatientPortalLayout })));
const PortalAIChatbot = lazy(() => import('../features/patients/components/PortalAIChatbot').then(m => ({ default: m.PortalAIChatbot })));
const PortalLogin = lazy(() => import('../features/portal/pages/PortalLogin').then(m => ({ default: m.PortalLogin })));
const PortalDashboard = lazy(() => import('../features/portal/pages/PortalDashboard').then(m => ({ default: m.PortalDashboard })));
const PortalRecords = lazy(() => import('../features/portal/pages/PortalRecords').then(m => ({ default: m.PortalRecords })));

// Lazy loaded doctor & staff pages
const DoctorDirectory = lazy(() => import('../features/doctors/pages/DoctorDirectory').then(m => ({ default: m.DoctorDirectory })));
const DoctorProfile = lazy(() => import('../features/doctors/pages/DoctorProfile').then(m => ({ default: m.DoctorProfile })));
const DoctorScheduleManager = lazy(() => import('../features/doctors/pages/DoctorScheduleManager').then(m => ({ default: m.DoctorScheduleManager })));
const StaffDirectory = lazy(() => import('../features/staff/pages/StaffDirectory').then(m => ({ default: m.StaffDirectory })));

// Lazy loaded appointment pages
const AppointmentList = lazy(() => import('../features/appointments/pages/AppointmentList').then(m => ({ default: m.AppointmentList })));
const AppointmentCalendar = lazy(() => import('../features/appointments/pages/AppointmentCalendar').then(m => ({ default: m.AppointmentCalendar })));
const BookAppointment = lazy(() => import('../features/appointments/pages/BookAppointment').then(m => ({ default: m.BookAppointment })));
const ReceptionDashboard = lazy(() => import('../features/appointments/pages/ReceptionDashboard').then(m => ({ default: m.ReceptionDashboard })));
const QueueBoard = lazy(() => import('../features/appointments/pages/QueueBoard').then(m => ({ default: m.QueueBoard })));
const ConsultationStart = lazy(() => import('../features/ehr/pages/ConsultationStart').then(m => ({ default: m.ConsultationStart })));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-app"><LoadingSpinner size="lg" className="text-primary" /></div>}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  // Auth Routes
  {
    path: '/login',
    element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>,
  },
  {
    path: '/forgot-password',
    element: <SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper>,
  },
  {
    path: '/reset-password/:token',
    element: <SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper>,
  },
  {
    path: '/verify-email/:token',
    element: <SuspenseWrapper><VerifyEmailPage /></SuspenseWrapper>,
  },
  
  // Super Admin Routes
  {
    path: '/super-admin',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={[Role.SUPER_ADMIN]}>
          <SuperAdminLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><SuperAdminDashboard /></SuspenseWrapper>,
      },
      {
        path: 'hospitals',
        element: <SuspenseWrapper><HospitalList /></SuspenseWrapper>,
      },
      {
        path: 'hospitals/new',
        element: <SuspenseWrapper><HospitalForm /></SuspenseWrapper>,
      },
      {
        path: 'hospitals/:id',
        element: <SuspenseWrapper><HospitalDetail /></SuspenseWrapper>,
      },
      {
        path: 'hospitals/:id/edit',
        element: <SuspenseWrapper><HospitalForm /></SuspenseWrapper>,
      },
      {
        path: 'plans',
        element: <SuspenseWrapper><SubscriptionPlans /></SuspenseWrapper>,
      },
      {
        path: 'analytics',
        element: <SuspenseWrapper><Analytics /></SuspenseWrapper>,
      },
      {
        path: 'system',
        element: <SuspenseWrapper><SystemMonitor /></SuspenseWrapper>,
      },
      {
        path: 'audit',
        element: <SuspenseWrapper><AuditLogs /></SuspenseWrapper>,
      },
    ],
  },

  // Hospital Admin Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={[Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN]}>
          <HospitalAdminLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <SuspenseWrapper><HospitalAdminDashboard /></SuspenseWrapper>,
      },
      {
        path: 'departments',
        element: <SuspenseWrapper><DepartmentList /></SuspenseWrapper>,
      },
      {
        path: 'staff',
        element: <SuspenseWrapper><StaffList /></SuspenseWrapper>,
      },
      {
        path: 'wards',
        element: <SuspenseWrapper><WardManagement /></SuspenseWrapper>,
      },
      {
        path: 'roles',
        element: <SuspenseWrapper><RoleManagement /></SuspenseWrapper>,
      },
      {
        path: 'settings',
        element: <SuspenseWrapper><HospitalSettings /></SuspenseWrapper>,
      },
    ],
  },

  // Protected Routes (Hospital Admin, Doctor, Nurse, etc)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <PageWrapper title="Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Patients"
                value="1,248"
                icon={<Users className="h-5 w-5" />}
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="Appointments Today"
                value="42"
                icon={<Calendar className="h-5 w-5" />}
                trend={{ value: 8, isPositive: true }}
              />
              <StatsCard
                title="Active Consultations"
                value="18"
                icon={<Activity className="h-5 w-5" />}
                trend={{ value: 2, isPositive: false }}
              />
              <StatsCard
                title="Monthly Growth"
                value="+24%"
                icon={<TrendingUp className="h-5 w-5" />}
                trend={{ value: 4.8, isPositive: true }}
              />
            </div>
          </PageWrapper>
        ),
      },
      {
        path: '2fa-setup',
        element: (
          <PageWrapper title="Two-Factor Authentication Setup">
            <SuspenseWrapper><TwoFactorSetupPage /></SuspenseWrapper>
          </PageWrapper>
        ),
      },
      {
        path: 'patients/register',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.RECEPTIONIST, Role.NURSE, Role.DOCTOR]}>
            <PageWrapper title="Register Patient">
              <SuspenseWrapper><PatientRegistrationPage /></SuspenseWrapper>
            </PageWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'patients',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.RECEPTIONIST, Role.NURSE, Role.DOCTOR]}>
            <SuspenseWrapper><PatientDirectory /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'patients/:id',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.RECEPTIONIST, Role.NURSE, Role.DOCTOR]}>
            <SuspenseWrapper><PatientProfile /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'doctors',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.RECEPTIONIST, Role.NURSE, Role.DOCTOR]}>
            <SuspenseWrapper><DoctorDirectory /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'doctors/:id',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.RECEPTIONIST, Role.NURSE, Role.DOCTOR]}>
            <SuspenseWrapper><DoctorProfile /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'doctors/:id/schedule',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR]}>
            <SuspenseWrapper><DoctorScheduleManager /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'staff-directory',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]}>
            <SuspenseWrapper><StaffDirectory /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'appointments',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE]}>
            <SuspenseWrapper><AppointmentList /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'appointments/calendar',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE]}>
            <SuspenseWrapper><AppointmentCalendar /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'appointments/book',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.RECEPTIONIST]}>
            <SuspenseWrapper><BookAppointment /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'appointments/reception',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.RECEPTIONIST]}>
            <SuspenseWrapper><ReceptionDashboard /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'consultation/new',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.SENIOR_DOCTOR]}>
            <SuspenseWrapper><ConsultationStart /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      // Other routes will be added here
    ],
  },
  {
    path: '/queue-board',
    element: <SuspenseWrapper><QueueBoard /></SuspenseWrapper>
  },
  {
    path: '/portal/login',
    element: <SuspenseWrapper><PortalLogin /></SuspenseWrapper>
  },
  {
    path: '/portal',
    element: <SuspenseWrapper><PatientPortalLayout /></SuspenseWrapper>,
    children: [
      {
        index: true,
        element: <SuspenseWrapper><PortalDashboard /></SuspenseWrapper>
      },
      {
        path: 'records',
        element: <SuspenseWrapper><PortalRecords /></SuspenseWrapper>
      },
      {
        path: 'assistant',
        element: <SuspenseWrapper><PortalAIChatbot /></SuspenseWrapper>
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
