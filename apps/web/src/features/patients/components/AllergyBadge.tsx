import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { SharedAllergy } from '@medicalink/shared';

interface AllergyBadgeProps {
  allergy: SharedAllergy;
  className?: string;
  showIcon?: boolean;
}

export const AllergyBadge: React.FC<AllergyBadgeProps> = ({ allergy, className, showIcon = true }) => {
  const severityConfig = {
    MILD: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    MODERATE: 'bg-orange-50 text-orange-700 border-orange-200',
    SEVERE: 'bg-red-50 text-red-700 border-red-200 font-medium',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs',
        severityConfig[allergy.severity],
        className
      )}
      title={`Reaction: ${allergy.reaction}`}
    >
      {showIcon && <ShieldAlert size={12} className="opacity-80" />}
      <span>{allergy.allergen}</span>
    </div>
  );
};
