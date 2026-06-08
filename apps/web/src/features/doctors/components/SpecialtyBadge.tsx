import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SpecialtyBadgeProps {
  specialty: string;
  isPrimary?: boolean;
  className?: string;
}

const colorMap: Record<string, string> = {
  Cardiology: 'bg-red-100 text-red-800 border-red-200',
  Neurology: 'bg-purple-100 text-purple-800 border-purple-200',
  Orthopedics: 'bg-orange-100 text-orange-800 border-orange-200',
  Pediatrics: 'bg-pink-100 text-pink-800 border-pink-200',
  Oncology: 'bg-rose-100 text-rose-800 border-rose-200',
  Dermatology: 'bg-teal-100 text-teal-800 border-teal-200',
  Psychiatry: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  General: 'bg-blue-100 text-blue-800 border-blue-200',
  Emergency: 'bg-red-600 text-white border-red-700',
  Surgery: 'bg-slate-800 text-white border-slate-900',
};

export const SpecialtyBadge: React.FC<SpecialtyBadgeProps> = ({
  specialty,
  isPrimary = false,
  className,
}) => {
  // Find a matching color, or default to a cool gray
  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  
  for (const [key, value] of Object.entries(colorMap)) {
    if (specialty.toLowerCase().includes(key.toLowerCase())) {
      colorClass = value;
      break;
    }
  }

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          colorClass,
          isPrimary && 'ring-2 ring-offset-1 ring-indigo-500',
          className
        )
      )}
    >
      {specialty}
    </span>
  );
};
