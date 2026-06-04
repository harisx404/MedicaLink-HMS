interface UsageBarProps {
  label: string;
  value: number;
  max: number | string;
  unit?: string;
  colorClass?: string;
  className?: string;
}

export const UsageBar = ({ label, value, max, unit = '', colorClass = 'bg-emerald-500', className = '' }: UsageBarProps) => {
  const numericMax = typeof max === 'string' ? Infinity : max;
  const percentage = numericMax === Infinity ? 0 : Math.min(100, Math.max(0, (value / numericMax) * 100));
  const isUnlimited = numericMax === Infinity;

  return (
    <div className={`bg-slate-950 p-4 rounded-xl border border-slate-800 ${className}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">
        {value.toLocaleString()} {unit}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {isUnlimited ? 'Unlimited' : `Limit: ${max} ${unit}`.trim()}
      </p>
      {!isUnlimited && (
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
          <div className={`${colorClass} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
      )}
    </div>
  );
};
