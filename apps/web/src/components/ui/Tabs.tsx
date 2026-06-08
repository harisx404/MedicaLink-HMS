import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export const Tabs: React.FC<{
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}> = ({ value, onValueChange, className, children }) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div className={twMerge(clsx('w-full', className))}>{children}</div>
  </TabsContext.Provider>
);

export const TabsList: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={twMerge(clsx('flex items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500', className))}>
    {children}
  </div>
);

export const TabsTrigger: React.FC<{ value: string; className?: string; children: React.ReactNode }> = ({ value, className, children }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  const isActive = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isActive ? 'bg-white text-slate-950 shadow-sm' : 'hover:bg-slate-50 hover:text-slate-900',
          className
        )
      )}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{ value: string; className?: string; children: React.ReactNode }> = ({ value, className, children }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  
  if (context.value !== value) return null;

  return (
    <div
      className={twMerge(
        clsx(
          'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          className
        )
      )}
    >
      {children}
    </div>
  );
};
