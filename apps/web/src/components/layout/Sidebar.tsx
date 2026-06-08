import { Link, useLocation } from 'react-router-dom';
import { Activity, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  navItems: NavItem[];
}

export function Sidebar({ isCollapsed, onToggleCollapse, navItems }: SidebarProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen flex flex-col bg-[#0A1628] border-r border-[#1e293b]/50 fixed left-0 top-0 z-20 text-slate-300"
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e293b]/50 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 text-white pl-2"
            >
              <Activity className="h-6 w-6 text-teal-400" />
              <span className="font-heading font-bold text-xl tracking-tight text-white">MedicaLink</span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="w-full flex justify-center text-white"
            >
              <Activity className="h-6 w-6 text-teal-400" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-2 border-b border-[#1e293b]/30">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-full bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-all duration-200 group relative py-2.5",
                isCollapsed ? "justify-center px-0" : "px-3 gap-3",
                isActive
                  ? "bg-indigo-600/20 text-white border-l-4 border-indigo-500 rounded-l-none"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-white border-l-4 border-transparent"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors duration-200", 
                isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white"
              )} />
              
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.name}
                </motion.span>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-16 scale-0 rounded bg-[#1e293b] p-2 text-xs font-semibold text-white shadow-md group-hover:scale-100 transition-all origin-left duration-150 z-30 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Actions */}
      <div className={cn("p-4 border-t border-[#1e293b]/50", isCollapsed && "flex justify-center px-0")}>
        <button
          onClick={() => dispatch(logout())}
          className={cn(
            "flex items-center rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors py-2.5 w-full",
            isCollapsed ? "justify-center px-0" : "px-3 gap-3"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              Log Out
            </motion.span>
          )}

          {isCollapsed && (
            <div className="absolute left-16 scale-0 rounded bg-[#1e293b] p-2 text-xs font-semibold text-rose-300 shadow-md group-hover:scale-100 transition-all origin-left duration-150 z-30 whitespace-nowrap">
              Log Out
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
