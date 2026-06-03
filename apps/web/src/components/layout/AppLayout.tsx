import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout() {
  // In Phase 1, we will uncomment this to enforce authentication
  /*
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  */

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
        <Header />
        <main className="flex-1 overflow-x-hidden bg-muted/10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
