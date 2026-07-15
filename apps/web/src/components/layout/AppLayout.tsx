import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion } from 'framer-motion';
import { ClinicalAssistantDrawer } from '../../features/ai/components/ClinicalAssistantDrawer';
import {
  LayoutDashboard, Users, Calendar, Pill, FlaskConical, CreditCard,
  Stethoscope, Droplet, UserCircle, Video, ActivitySquare, CalendarDays,
  PieChart, Bell, MessageSquare,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard',       href: '/dashboard',           icon: LayoutDashboard },
  { name: 'Appointments',    href: '/appointments',         icon: Calendar },
  { name: 'Patients',        href: '/patients',             icon: Users },
  { name: 'Staff Directory', href: '/staff-directory',      icon: UserCircle },
  { name: 'Telemedicine',    href: '/telemedicine',         icon: Video },
  { name: 'Emergency',       href: '/emergency',            icon: Stethoscope },
  { name: 'Nursing & Wards', href: '/nursing',              icon: ActivitySquare },
  { name: 'ICU',             href: '/icu',                  icon: ActivitySquare },
  { name: 'Operation Theater', href: '/ot/schedule',        icon: CalendarDays },
  { name: 'Pharmacy',        href: '/pharmacy',             icon: Pill },
  { name: 'Laboratory',      href: '/lab',                  icon: FlaskConical },
  { name: 'Radiology',       href: '/radiology',            icon: ActivitySquare },
  { name: 'Blood Bank',      href: '/bloodbank',            icon: Droplet },
  { name: 'Billing',         href: '/billing',              icon: CreditCard },
  { name: 'Analytics',       href: '/analytics/executive',  icon: PieChart },
  { name: 'Notifications',   href: '/notifications',        icon: Bell },
  { name: 'Messages',        href: '/messages',             icon: MessageSquare },
];

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

      <ClinicalAssistantDrawer />
    </div>
  );
}
