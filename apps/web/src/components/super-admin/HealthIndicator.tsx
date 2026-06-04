import React from 'react';

export type StatusType = 'Operational' | 'Degraded' | 'Down';

interface HealthIndicatorProps {
  status: StatusType;
  label: string;
  subLabel?: string;
  icon?: React.ElementType;
}

export const HealthIndicator = ({ status, label, subLabel, icon: Icon }: HealthIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Operational':
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', color: 'bg-emerald-500' };
      case 'Degraded':
        return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', color: 'bg-amber-500' };
      case 'Down':
        return { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', color: 'bg-rose-500' };
      default:
        return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', color: 'bg-slate-500' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`p-4 ${config.bg} border ${config.border} rounded-xl`}>
      <div className="flex items-center gap-3">
        {Icon ? (
          <Icon className={`w-5 h-5 ${config.text}`} />
        ) : (
          <span className={`flex h-3 w-3 relative shrink-0`}>
            {status === 'Operational' && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${config.color}`}></span>
          </span>
        )}
        <div>
          <p className={`text-sm font-semibold ${config.text}`}>{label}</p>
          {subLabel && <p className={`text-xs ${config.text} opacity-70 mt-0.5`}>{subLabel}</p>}
        </div>
      </div>
    </div>
  );
};
