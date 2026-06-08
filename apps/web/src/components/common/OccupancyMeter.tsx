export interface OccupancyMeterProps {
  total: number;
  occupied: number;
  size?: number;
  strokeWidth?: number;
}

export function OccupancyMeter({ total, occupied, size = 64, strokeWidth = 8 }: OccupancyMeterProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = total > 0 ? (occupied / total) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;

  let colorClass = 'text-emerald-500';
  if (percentage > 80) colorClass = 'text-rose-500';
  else if (percentage > 60) colorClass = 'text-amber-500';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          className="text-slate-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Text inside the circle */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-slate-700 leading-none">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}
