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

// Lazy loaded pharmacy pages
const PharmacyDashboard = lazy(() => import('../features/pharmacy/pages/PharmacyDashboard').then(m => ({ default: m.PharmacyDashboard })));
const DispensingWorkstation = lazy(() => import('../features/pharmacy/pages/DispensingWorkstation').then(m => ({ default: m.DispensingWorkstation })));
const DrugInventory = lazy(() => import('../features/pharmacy/pages/DrugInventory').then(m => ({ default: m.DrugInventory })));
const PurchaseOrders = lazy(() => import('../features/pharmacy/pages/PurchaseOrders').then(m => ({ default: m.PurchaseOrders })));
const SupplierManagement = lazy(() => import('../features/pharmacy/pages/SupplierManagement').then(m => ({ default: m.SupplierManagement })));
const NarcoticsRegister = lazy(() => import('../features/pharmacy/pages/NarcoticsRegister').then(m => ({ default: m.NarcoticsRegister })));

// Lazy loaded lab pages
const LabDashboard = React.lazy(() => import('../features/lab/pages/LabDashboard').then(m => ({ default: m.LabDashboard })));
const SampleCollection = React.lazy(() => import('../features/lab/pages/SampleCollection').then(m => ({ default: m.SampleCollection })));
const ResultEntry = React.lazy(() => import('../features/lab/pages/ResultEntry').then(m => ({ default: m.ResultEntry })));
const Verification = React.lazy(() => import('../features/lab/pages/Verification').then(m => ({ default: m.Verification })));
const TestCatalog = React.lazy(() => import('../features/lab/pages/TestCatalog').then(m => ({ default: m.TestCatalog })));
const LabReportView = React.lazy(() => import('../features/lab/pages/LabReportView').then(m => ({ default: m.LabReportView })));

// Lazy loaded billing pages
const BillingDashboard = React.lazy(() => import('../features/billing/pages/BillingDashboard').then(m => ({ default: m.BillingDashboard })));
const BillList = lazy(() => import('../features/billing/pages/BillList').then(m => ({ default: m.BillList })));
const BillDetail = lazy(() => import('../features/billing/pages/BillDetail').then(m => ({ default: m.BillDetail })));
const CreateBill = lazy(() => import('../features/billing/pages/CreateBill').then(m => ({ default: m.CreateBill })));
const ServiceChargeMaster = lazy(() => import('../features/billing/pages/ServiceChargeMaster').then(m => ({ default: m.ServiceChargeMaster })));
const FinancialReports = lazy(() => import('../features/billing/pages/FinancialReports').then(m => ({ default: m.FinancialReports })));
const InsuranceClaims = lazy(() => import('../features/billing/pages/InsuranceClaims').then(m => ({ default: m.InsuranceClaims })));

// Emergency & ICU
const EmergencyDashboard = lazy(() => import('../features/emergency/pages/EmergencyDashboard').then(m => ({ default: m.EmergencyDashboard })));
const TriageInterface = lazy(() => import('../features/emergency/pages/TriageInterface').then(m => ({ default: m.TriageInterface })));
const AmbulanceTracking = lazy(() => import('../features/emergency/pages/AmbulanceTracking').then(m => ({ default: m.AmbulanceTracking })));
const ICUDashboard = lazy(() => import('../features/icu/pages/ICUDashboard').then(m => ({ default: m.ICUDashboard })));
const ICUPatientDetail = lazy(() => import('../features/icu/pages/ICUPatientDetail').then(m => ({ default: m.ICUPatientDetail })));
const OTScheduleBoard = lazy(() => import('../features/ot/pages/OTScheduleBoard').then(m => ({ default: m.OTScheduleBoard })));
const OTCaseDetail = lazy(() => import('../features/ot/pages/OTCaseDetail').then(m => ({ default: m.OTCaseDetail })));
const BloodBankDashboard = lazy(() => import('../features/bloodbank/pages/BloodBankDashboard').then(m => ({ default: m.BloodBankDashboard })));
const DonorManagement = lazy(() => import('../features/bloodbank/pages/DonorManagement').then(m => ({ default: m.DonorManagement })));
const BloodInventory = lazy(() => import('../features/bloodbank/pages/BloodInventory').then(m => ({ default: m.BloodInventory })));
const BloodRequests = lazy(() => import('../features/bloodbank/pages/BloodRequests').then(m => ({ default: m.BloodRequests })));
const TelemedicineDashboard = lazy(() => import('../features/telemedicine/pages/TelemedicineDashboard').then(m => ({ default: m.TelemedicineDashboard })));
const VirtualWaitingRoom = lazy(() => import('../features/telemedicine/pages/VirtualWaitingRoom').then(m => ({ default: m.VirtualWaitingRoom })));
const VideoConsultation = lazy(() => import('../features/telemedicine/pages/VideoConsultation').then(m => ({ default: m.VideoConsultation })));
const SessionNotes = lazy(() => import('../features/telemedicine/pages/SessionNotes').then(m => ({ default: m.SessionNotes })));
const TelemedicineHistory = lazy(() => import('../features/telemedicine/pages/TelemedicineHistory').then(m => ({ default: m.TelemedicineHistory })));

// Analytics
const ExecutiveDashboard = lazy(() => import('../features/analytics/pages/ExecutiveDashboard').then(m => ({ default: m.ExecutiveDashboard })));
const ClinicalAnalytics = lazy(() => import('../features/analytics/pages/ClinicalAnalytics').then(m => ({ default: m.ClinicalAnalytics })));
const OperationalAnalytics = lazy(() => import('../features/analytics/pages/OperationalAnalytics').then(m => ({ default: m.OperationalAnalytics })));
const FinancialAnalytics = lazy(() => import('../features/analytics/pages/FinancialAnalytics').then(m => ({ default: m.FinancialAnalytics })));
const CustomReportBuilder = lazy(() => import('../features/analytics/pages/CustomReportBuilder').then(m => ({ default: m.CustomReportBuilder })));

// HR & Staff Management
const HRDashboard = lazy(() => import('../features/hr/pages/HRDashboard').then(m => ({ default: m.HRDashboard })));
const EmployeeDirectory = lazy(() => import('../features/hr/pages/EmployeeDirectory').then(m => ({ default: m.EmployeeDirectory })));
const AttendanceTerminal = lazy(() => import('../features/hr/pages/AttendanceTerminal').then(m => ({ default: m.AttendanceTerminal })));
const LeaveManagement = lazy(() => import('../features/hr/pages/LeaveManagement').then(m => ({ default: m.LeaveManagement })));
const PayrollProcessing = lazy(() => import('../features/hr/pages/PayrollProcessing').then(m => ({ default: m.PayrollProcessing })));

// Notifications & Messaging (Phase 18)
const NotificationCenterPage = lazy(() => import('../features/notifications/pages/NotificationCenterPage').then(m => ({ default: m.NotificationCenterPage })));
const InternalMessagingPage = lazy(() => import('../features/messages/pages/InternalMessagingPage').then(m => ({ default: m.InternalMessagingPage })));

// Nursing & Ward Management
const NurseDashboard = lazy(() => import('../features/nursing/pages/NurseDashboard').then(m => ({ default: m.NurseDashboard })));
const PatientNursingView = lazy(() => import('../features/nursing/pages/PatientNursingView').then(m => ({ default: m.PatientNursingView })));
const ShiftHandover = lazy(() => import('../features/nursing/pages/ShiftHandover').then(m => ({ default: m.ShiftHandover })));

// Radiology Pages
const RadiologyDashboard = lazy(() => import('../features/radiology/pages/RadiologyDashboard').then(m => ({ default: m.RadiologyDashboard })));
const OrderQueue = lazy(() => import('../features/radiology/pages/OrderQueue').then(m => ({ default: m.OrderQueue })));
const ReportWriter = lazy(() => import('../features/radiology/pages/ReportWriter').then(m => ({ default: m.ReportWriter })));

// Inventory Pages
const InventoryDashboard = lazy(() => import('../features/inventory/pages/InventoryDashboard').then(m => ({ default: m.InventoryDashboard })));
const StockList = lazy(() => import('../features/inventory/pages/StockList').then(m => ({ default: m.StockList })));
const StockMovement = lazy(() => import('../features/inventory/pages/StockMovement').then(m => ({ default: m.StockMovement })));
const AssetRegister = lazy(() => import('../features/inventory/pages/AssetRegister').then(m => ({ default: m.AssetRegister })));
const InventoryPurchaseOrders = lazy(() => import('../features/inventory/pages/PurchaseOrders').then(m => ({ default: m.PurchaseOrders })));
const VendorManagement = lazy(() => import('../features/inventory/pages/VendorManagement').then(m => ({ default: m.VendorManagement })));

// Document & Compliance Pages
const DocumentRepository = lazy(() => import('../features/documents/pages/DocumentRepository').then(m => ({ default: m.DocumentRepository })));
const ConsentManagement = lazy(() => import('../features/documents/pages/ConsentManagement').then(m => ({ default: m.ConsentManagement })));
const ComplianceDashboard = lazy(() => import('../features/compliance/pages/ComplianceDashboard').then(m => ({ default: m.ComplianceDashboard })));

// Landing Page
const LandingPage = lazy(() => import('../pages/Landing/LandingPage').then(m => ({ default: m.LandingPage })));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-app"><LoadingSpinner size="lg" className="text-primary" /></div>}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  // Public Landing Page
  {
    path: '/',
    element: <SuspenseWrapper><LandingPage /></SuspenseWrapper>,
  },
  
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
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
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
      {
        path: 'pharmacy',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.PHARMACIST]}>
            <SuspenseWrapper><PharmacyDashboard /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'pharmacy/dispense',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.PHARMACIST]}>
            <SuspenseWrapper><DispensingWorkstation /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'pharmacy/inventory',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.PHARMACIST, Role.INVENTORY_MANAGER]}>
            <SuspenseWrapper><DrugInventory /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'pharmacy/purchase-orders',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.PHARMACIST, Role.INVENTORY_MANAGER]}>
            <SuspenseWrapper><PurchaseOrders /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'pharmacy/suppliers',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.PHARMACIST, Role.INVENTORY_MANAGER]}>
            <SuspenseWrapper><SupplierManagement /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'pharmacy/narcotics',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.PHARMACIST]}>
            <SuspenseWrapper><NarcoticsRegister /></SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'lab',
        element: <SuspenseWrapper><LabDashboard /></SuspenseWrapper>
      },
      {
        path: 'lab/collection',
        element: <SuspenseWrapper><SampleCollection /></SuspenseWrapper>
      },
      {
        path: 'lab/entry',
        element: <SuspenseWrapper><ResultEntry /></SuspenseWrapper>
      },
      {
        path: 'lab/verification',
        element: <SuspenseWrapper><Verification /></SuspenseWrapper>
      },
      {
        path: 'lab/catalog',
        element: <SuspenseWrapper><TestCatalog /></SuspenseWrapper>
      },
      {
        path: 'lab/report/:id',
        element: <SuspenseWrapper><LabReportView /></SuspenseWrapper>
      },
      {
        path: 'billing',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.BILLING_STAFF, Role.RECEPTIONIST, Role.DOCTOR]}>
            <SuspenseWrapper><BillingDashboard /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'billing/new',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.BILLING_STAFF]}>
            <SuspenseWrapper><CreateBill /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'billing/bills',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.BILLING_STAFF, Role.RECEPTIONIST, Role.DOCTOR]}>
            <SuspenseWrapper><BillList /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'billing/bills/:id',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.BILLING_STAFF, Role.RECEPTIONIST, Role.DOCTOR]}>
            <SuspenseWrapper><BillDetail /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'billing/insurance',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.BILLING_STAFF]}>
            <SuspenseWrapper><InsuranceClaims /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'billing/reports',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.BILLING_STAFF]}>
            <SuspenseWrapper><FinancialReports /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'billing/services',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.BILLING_STAFF]}>
            <SuspenseWrapper><ServiceChargeMaster /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      // Emergency Routes
      {
        path: 'emergency',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.EMERGENCY_STAFF, Role.DOCTOR, Role.NURSE]}>
            <SuspenseWrapper><EmergencyDashboard /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'emergency/triage',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.EMERGENCY_STAFF, Role.NURSE, Role.DOCTOR]}>
            <SuspenseWrapper><TriageInterface /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'emergency/ambulances',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.EMERGENCY_STAFF]}>
            <SuspenseWrapper><AmbulanceTracking /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      // ICU Routes
      {
        path: 'icu',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.NURSE, Role.EMERGENCY_STAFF]}>
            <SuspenseWrapper><ICUDashboard /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'icu/patients/:id',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.NURSE, Role.EMERGENCY_STAFF]}>
            <SuspenseWrapper><ICUPatientDetail /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      { path: 'ot/schedule', element: <SuspenseWrapper><OTScheduleBoard /></SuspenseWrapper> },
      { path: 'ot/cases/:id', element: <SuspenseWrapper><OTCaseDetail /></SuspenseWrapper> },
      { path: 'bloodbank', element: <SuspenseWrapper><BloodBankDashboard /></SuspenseWrapper> },
      { path: 'bloodbank/donors', element: <SuspenseWrapper><DonorManagement /></SuspenseWrapper> },
      { path: 'bloodbank/inventory', element: <SuspenseWrapper><BloodInventory /></SuspenseWrapper> },
      { path: 'bloodbank/requests', element: <SuspenseWrapper><BloodRequests /></SuspenseWrapper> },
      // Telemedicine
      { path: 'telemedicine', element: <SuspenseWrapper><TelemedicineDashboard /></SuspenseWrapper> },
      { path: 'telemedicine/session/:id', element: <SuspenseWrapper><VideoConsultation /></SuspenseWrapper> },
      { path: 'telemedicine/session/:id/notes', element: <SuspenseWrapper><SessionNotes /></SuspenseWrapper> },
      { path: 'telemedicine/history', element: <SuspenseWrapper><TelemedicineHistory /></SuspenseWrapper> },
      
      // Analytics (Protected for Hospital Admin & Super Admin)
      { 
        path: 'analytics/executive', 
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]}>
            <SuspenseWrapper><ExecutiveDashboard /></SuspenseWrapper>
          </RoleGuard>
        ) 
      },
      { 
        path: 'analytics/clinical', 
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]}>
            <SuspenseWrapper><ClinicalAnalytics /></SuspenseWrapper>
          </RoleGuard>
        ) 
      },
      { 
        path: 'analytics/operational', 
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]}>
            <SuspenseWrapper><OperationalAnalytics /></SuspenseWrapper>
          </RoleGuard>
        ) 
      },
      { 
        path: 'analytics/financial', 
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]}>
            <SuspenseWrapper><FinancialAnalytics /></SuspenseWrapper>
          </RoleGuard>
        ) 
      },
      { 
        path: 'analytics/reports', 
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]}>
            <SuspenseWrapper><CustomReportBuilder /></SuspenseWrapper>
          </RoleGuard>
        ) 
      },
      // HR Routes
      { 
        path: 'hr/dashboard', 
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.HR_MANAGER]}>
            <SuspenseWrapper><HRDashboard /></SuspenseWrapper>
          </RoleGuard>
        ) 
      },
      { 
        path: 'hr/employees', 
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.HR_MANAGER]}>
            <SuspenseWrapper><EmployeeDirectory /></SuspenseWrapper>
          </RoleGuard>
        ) 
      },
      { 
        path: 'hr/attendance', 
        element: (
          <SuspenseWrapper><AttendanceTerminal /></SuspenseWrapper>
        ) 
      },
      { 
        path: 'hr/leaves', 
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.HR_MANAGER]}>
            <SuspenseWrapper><LeaveManagement /></SuspenseWrapper>
          </RoleGuard>
        ) 
      },
      { 
        path: 'hr/payroll', 
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.HR_MANAGER]}>
            <SuspenseWrapper><PayrollProcessing /></SuspenseWrapper>
          </RoleGuard>
        ) 
      },
      // Phase 18 — Notifications & Messaging
      {
        path: 'notifications',
        element: <SuspenseWrapper><NotificationCenterPage /></SuspenseWrapper>
      },
      {
        path: 'messages',
        element: <SuspenseWrapper><InternalMessagingPage /></SuspenseWrapper>
      },
      // Nursing Routes
      {
        path: 'nursing',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.NURSE, Role.DOCTOR]}>
            <SuspenseWrapper><NurseDashboard /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'nursing/patient/:id',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.NURSE, Role.DOCTOR]}>
            <SuspenseWrapper><PatientNursingView /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'nursing/handover',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.NURSE]}>
            <SuspenseWrapper><ShiftHandover /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      // Radiology Routes
      {
        path: 'radiology',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.NURSE, Role.LAB_TECHNICIAN, Role.RADIOLOGIST]}>
            <SuspenseWrapper><RadiologyDashboard /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'radiology/orders',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR, Role.NURSE, Role.LAB_TECHNICIAN, Role.RADIOLOGIST]}>
            <SuspenseWrapper><OrderQueue /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'radiology/reports/:orderId',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.RADIOLOGIST]}>
            <SuspenseWrapper><ReportWriter /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      // Inventory Routes
      {
        path: 'inventory',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.INVENTORY_MANAGER]}>
            <SuspenseWrapper><InventoryDashboard /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'inventory/items',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.INVENTORY_MANAGER, Role.NURSE, Role.PHARMACIST, Role.LAB_TECHNICIAN, Role.RADIOLOGIST]}>
            <SuspenseWrapper><StockList /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'inventory/transactions',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.INVENTORY_MANAGER, Role.NURSE, Role.PHARMACIST]}>
            <SuspenseWrapper><StockMovement /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'inventory/assets',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.INVENTORY_MANAGER]}>
            <SuspenseWrapper><AssetRegister /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'inventory/purchase-orders',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.INVENTORY_MANAGER]}>
            <SuspenseWrapper><InventoryPurchaseOrders /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      {
        path: 'inventory/vendors',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.INVENTORY_MANAGER]}>
            <SuspenseWrapper><VendorManagement /></SuspenseWrapper>
          </RoleGuard>
        )
      },
      // Document Management & Compliance
      {
        path: 'documents',
        element: (
          <SuspenseWrapper><DocumentRepository /></SuspenseWrapper>
        )
      },
      {
        path: 'consents',
        element: (
          <SuspenseWrapper><ConsentManagement /></SuspenseWrapper>
        )
      },
      {
        path: 'compliance',
        element: (
          <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN]}>
            <SuspenseWrapper><ComplianceDashboard /></SuspenseWrapper>
          </RoleGuard>
        )
      }
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
      },
      {
        path: 'waiting-room/:id',
        element: <SuspenseWrapper><VirtualWaitingRoom /></SuspenseWrapper>
      },
      {
        path: 'session/:id',
        element: <SuspenseWrapper><VideoConsultation /></SuspenseWrapper>
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
