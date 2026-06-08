import React, { Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, Calendar, FileText, CreditCard, LogOut, MessageSquare } from 'lucide-react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export const PatientPortalLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HeartPulse, path: '/portal' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/portal/appointments' },
    { id: 'records', label: 'My Records', icon: FileText, path: '/portal/records' },
    { id: 'bills', label: 'Billing', icon: CreditCard, path: '/portal/billing' },
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquare, path: '/portal/assistant' },
  ];

  return (
    <div className="min-h-screen bg-indigo-50/30 font-sans">
      {/* Mobile Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <HeartPulse size={18} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600">
              MedicaLink
            </h1>
          </div>
          <button className="text-gray-500 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-[calc(100vh-128px)] pb-24 pt-4 px-4">
        <Suspense fallback={<div className="flex h-full items-center justify-center pt-20"><LoadingSpinner size="lg" className="text-indigo-600" /></div>}>
          <Outlet />
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-30 pb-safe">
        <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/portal' && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={20} className={isActive ? 'fill-indigo-50/50' : ''} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
