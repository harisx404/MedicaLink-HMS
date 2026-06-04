import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Building2, LayoutDashboard, Settings, Activity, ShieldAlert, CreditCard, LogOut, Menu } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import type { RootState } from '../../store/store';

export const SuperAdminSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
    { name: 'Hospitals', href: '/super-admin/hospitals', icon: Building2 },
    { name: 'Subscriptions', href: '/super-admin/plans', icon: CreditCard },
    { name: 'Analytics', href: '/super-admin/analytics', icon: Activity },
    { name: 'System Health', href: '/super-admin/system', icon: Settings },
    { name: 'Audit Logs', href: '/super-admin/audit', icon: ShieldAlert },
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-300 w-64 border-r border-slate-800">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800">
        <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 mr-3">
          <Building2 className="w-6 h-6 text-emerald-400" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Super Admin</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
                           (item.href !== '/super-admin' && location.pathname.startsWith(item.href));
                           
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-slate-900 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-colors border border-transparent hover:border-slate-800"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-500" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SuperAdminSidebar />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <SuperAdminSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="text-slate-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400">System Online</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-slate-900 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
