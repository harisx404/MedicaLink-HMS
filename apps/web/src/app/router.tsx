import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PageWrapper } from '../components/layout/PageWrapper';

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
              {/* Dummy cards for Phase 0 */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                  <h3 className="text-muted-foreground text-sm font-medium">Metric {i}</h3>
                  <p className="text-2xl font-bold font-heading mt-2">1,024</p>
                </div>
              ))}
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
