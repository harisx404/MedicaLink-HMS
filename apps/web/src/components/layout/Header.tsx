import { Search, Globe } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { NotificationBell } from '../../features/notifications/components/NotificationBell';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { user } = useAppSelector((state) => state.auth);
  const { i18n } = useTranslation();

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
        {/* Language Switcher */}
        <div className="relative group">
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors flex items-center gap-1">
            <Globe className="h-5 w-5" />
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="py-1 flex flex-col">
              <button onClick={() => i18n.changeLanguage('en')} className="px-4 py-2 text-sm text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 w-full">English</button>
              <button onClick={() => i18n.changeLanguage('ar')} className="px-4 py-2 text-sm text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 w-full">العربية</button>
              <button onClick={() => i18n.changeLanguage('es')} className="px-4 py-2 text-sm text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 w-full">Español</button>
              <button onClick={() => i18n.changeLanguage('fr')} className="px-4 py-2 text-sm text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 w-full">Français</button>
            </div>
          </div>
        </div>

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
