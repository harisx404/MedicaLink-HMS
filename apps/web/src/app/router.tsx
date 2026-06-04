import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleGuard } from '../components/auth/RoleGuard';
import { SuperAdminLayout } from '../components/layout/SuperAdminLayout';
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
      // Other routes will be added here
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
