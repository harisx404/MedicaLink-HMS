import { Search, Globe } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { NotificationBell } from '../../features/notifications/components/NotificationBell';

export function Header() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border/40 sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search patients, doctors, or ID..."
            className="w-full h-10 pl-10 pr-4 bg-muted/30 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        {/* Language Switcher Placeholder */}
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors">
          <Globe className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border/40">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-none text-foreground">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.role.replace('_', ' ') || 'No Role'}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {user ? user.firstName[0] : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
