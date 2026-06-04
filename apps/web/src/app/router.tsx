import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatsCard } from '../components/ui';
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
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
      // Other routes will be added here
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
