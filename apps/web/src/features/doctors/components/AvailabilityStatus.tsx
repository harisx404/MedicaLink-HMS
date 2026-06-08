import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Circle } from 'lucide-react';

export type DoctorStatus = 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE' | 'OFFLINE';

interface AvailabilityStatusProps {
  status: DoctorStatus;
  className?: string;
  showText?: boolean;
}

const statusConfig: Record<DoctorStatus, { color: string; bg: string; text: string; label: string }> = {
  AVAILABLE: { color: 'text-green-500', bg: 'bg-green-100', text: 'text-green-800', label: 'Available' },
  IN_CONSULTATION: { color: 'text-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Consultation' },
  ON_LEAVE: { color: 'text-red-500', bg: 'bg-red-100', text: 'text-red-800', label: 'On Leave' },
  OFFLINE: { color: 'text-gray-400', bg: 'bg-gray-100', text: 'text-gray-600', label: 'Offline' },
};

export const AvailabilityStatus: React.FC<AvailabilityStatusProps> = ({
  status,
  className,
  showText = true,
}) => {
  const config = statusConfig[status] || statusConfig.OFFLINE;

  if (!showText) {
    return (
      <Circle
        className={twMerge(clsx('w-3 h-3 fill-current', config.color, className))}
      />
    );
  }

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          config.bg,
          config.text,
          className
        )
      )}
    >
      <Circle className={clsx('w-2 h-2 fill-current', config.color)} />
      {config.label}
    </span>
  );
};
