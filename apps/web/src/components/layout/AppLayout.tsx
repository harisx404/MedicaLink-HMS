import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion } from 'framer-motion';
import { ClinicalAssistantDrawer } from '../../features/ai/components/ClinicalAssistantDrawer';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Users, Calendar, Pill, FlaskConical, CreditCard,
  Stethoscope, Droplet, UserCircle, Video, ActivitySquare, CalendarDays,
  PieChart, Bell, MessageSquare, Package, FileText, FileSignature, ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard',       href: '/dashboard',           icon: LayoutDashboard, key: 'dashboard' },
  { name: 'Appointments',    href: '/appointments',         icon: Calendar, key: 'appointments' },
  { name: 'Patients',        href: '/patients',             icon: Users, key: 'patients' },
  { name: 'Staff Directory', href: '/staff-directory',      icon: UserCircle, key: 'staff' },
  { name: 'Telemedicine',    href: '/telemedicine',         icon: Video, key: 'telemedicine' },
  { name: 'Emergency',       href: '/emergency',            icon: Stethoscope, key: 'emergency' },
  { name: 'Nursing & Wards', href: '/nursing',              icon: ActivitySquare, key: 'nursing' },
  { name: 'ICU',             href: '/icu',                  icon: ActivitySquare, key: 'icu' },
  { name: 'Operation Theater', href: '/ot/schedule',        icon: CalendarDays, key: 'ot' },
  { name: 'Pharmacy',        href: '/pharmacy',             icon: Pill, key: 'pharmacy' },
  { name: 'Laboratory',      href: '/lab',                  icon: FlaskConical, key: 'lab' },
  { name: 'Radiology',       href: '/radiology',            icon: ActivitySquare, key: 'radiology' },
  { name: 'Inventory',       href: '/inventory',            icon: Package, key: 'inventory' },
  { name: 'Blood Bank',      href: '/bloodbank',            icon: Droplet, key: 'bloodbank' },
  { name: 'Billing',         href: '/billing',              icon: CreditCard, key: 'billing' },
  { name: 'Analytics',       href: '/analytics/executive',  icon: PieChart, key: 'analytics' },
  { name: 'Notifications',   href: '/notifications',        icon: Bell, key: 'notifications' },
  { name: 'Messages',        href: '/messages',             icon: MessageSquare, key: 'messages' },
  { name: 'Documents',       href: '/documents',            icon: FileText, key: 'documents' },
  { name: 'Consents',        href: '/consents',             icon: FileSignature, key: 'consents' },
  { name: 'Compliance',      href: '/compliance',           icon: ShieldCheck, key: 'compliance' },
];

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();

  const translatedNavItems = NAV_ITEMS.map(item => ({
    ...item,
    name: t(item.key, { defaultValue: item.name })
  }));

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} navItems={translatedNavItems} />
      <motion.div
        initial={false}
        animate={{ marginInlineStart: isCollapsed ? 80 : 256 }}
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
