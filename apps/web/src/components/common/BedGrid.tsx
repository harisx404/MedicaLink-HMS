import { Bed as BedIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BedData {
  _id: string;
  bedNumber: string;
  type: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  currentPatient?: { name: string };
}

interface BedGridProps {
  beds: BedData[];
  onBedClick?: (bed: BedData) => void;
  className?: string;
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function BedGrid({ beds, onBedClick, className }: BedGridProps) {
  if (!beds || beds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <BedIcon className="w-12 h-12 text-slate-300 mb-3" />
        <p>No beds found in this ward.</p>
      </div>
    );
  }

  const statusColors = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200',
    OCCUPIED: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200',
    MAINTENANCE: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    RESERVED: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
  };

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4", className)}>
      {beds.map((bed) => (
        <div
          key={bed._id}
          onClick={() => onBedClick?.(bed)}
          className={cn(
            "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer group",
            statusColors[bed.status]
          )}
        >
          <BedIcon className="w-8 h-8 mb-2" />
          <span className="font-bold text-sm">{bed.bedNumber}</span>
          <span className="text-[10px] font-medium uppercase tracking-wider opacity-80 mt-1">
            {bed.status}
          </span>
          
          {/* Tooltip for Occupied Beds */}
          {bed.status === 'OCCUPIED' && bed.currentPatient && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              Patient: {bed.currentPatient.name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
