import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, HeartPulse, Activity, DollarSign, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';

const navItems = [
  { name: 'Executive Dashboard', href: '/analytics/executive', icon: LayoutDashboard },
  { name: 'Clinical', href: '/analytics/clinical', icon: HeartPulse },
  { name: 'Operational', href: '/analytics/operational', icon: Activity },
  { name: 'Financial', href: '/analytics/financial', icon: DollarSign },
  { name: 'Custom Reports', href: '/analytics/reports', icon: FileText },
];

export const AnalyticsNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="mb-6 bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex overflow-x-auto max-w-full">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors duration-200",
              isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <Icon className={cn("w-4 h-4 mr-2", isActive ? "text-indigo-600" : "text-gray-400")} />
            {item.name}
          </NavLink>
        );
      })}
    </div>
  );
};
