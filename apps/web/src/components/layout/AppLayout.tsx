import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion } from 'framer-motion';

import { Home, Users, Calendar, Activity, Settings, Pill, Beaker, Receipt, Heart } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'EHR', href: '/ehr', icon: Activity },
  { name: 'Pharmacy', href: '/pharmacy', icon: Pill },
  { name: 'Laboratory', href: '/lab', icon: Beaker },
  { name: 'Billing', href: '/billing', icon: Receipt },
  { name: 'Emergency', href: '/emergency', icon: Activity },
  { name: 'ICU', href: '/icu', icon: Heart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // In Phase 1, we will uncomment this to enforce authentication
  /*
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  */

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} navItems={NAV_ITEMS} />
      <motion.div
        initial={false}
        animate={{ marginLeft: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-h-screen relative"
      >
        <Header />
        <main className="flex-1 overflow-x-hidden bg-muted/10">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
