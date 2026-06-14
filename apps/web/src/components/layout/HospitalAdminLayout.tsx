import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../store/hooks';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  Bed,
  Shield,
  Activity
} from 'lucide-react';

const HOSPITAL_ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Departments', href: '/admin/departments', icon: Building2 },
  { name: 'Wards & Beds', href: '/admin/wards', icon: Bed },
  { name: 'Staff', href: '/admin/users', icon: Users },
  { name: 'Roles', href: '/admin/roles', icon: Shield },
  { name: 'Analytics', href: '/analytics/executive', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function HospitalAdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Ensure they are actually a HOSPITAL_ADMIN
  if (user?.role !== 'HOSPITAL_ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* We reuse the generic Sidebar but pass the Hospital Admin navigation items */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        navItems={HOSPITAL_ADMIN_NAV_ITEMS}
      />
      
      <motion.div
        initial={false}
        animate={{ marginLeft: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-h-screen relative"
      >
        <Header />
        <main className="flex-1 overflow-auto bg-slate-50/50 p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
