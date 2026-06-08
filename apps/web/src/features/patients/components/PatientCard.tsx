import React from 'react';
import { motion } from 'framer-motion';
import type { SharedPatient } from '@medicalink/shared';
import { User, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import { UHIDDisplay } from './UHIDDisplay';
import { AllergyBadge } from './AllergyBadge';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { formatPatientAge } from '../../../utils/ageUtils';

interface PatientCardProps {
  patient: SharedPatient;
  onClick?: (patient: SharedPatient) => void;
  className?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick, className }) => {
  const age = formatPatientAge(patient.dateOfBirth);
  
  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
      onClick={() => onClick?.(patient)}
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-5 cursor-pointer transition-all',
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {patient.photo ? (
            <img 
              src={patient.photo} 
              alt={`${patient.firstName} ${patient.lastName}`} 
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100">
              <User size={24} />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {patient.firstName} {patient.lastName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <UHIDDisplay uhid={patient.uhid} size="sm" />
              <span className="text-xs text-gray-500">
                {patient.gender.charAt(0)}{patient.gender.slice(1).toLowerCase()} • {age}
              </span>
            </div>
          </div>
        </div>
        <div className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', patient.isActive ? statusColors.ACTIVE : statusColors.INACTIVE)}>
          {patient.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="space-y-2 mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-gray-400" />
          <span>{patient.phone}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="truncate">{patient.address.city}, {patient.address.state}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span>Reg: {format(new Date(patient.registrationDate), 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span>Last Visit: {patient.lastVisitDate ? format(new Date(patient.lastVisitDate), 'MMM dd, yyyy') : 'No visits'}</span>
        </div>
      </div>

      {(patient.allergies && patient.allergies.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-1.5">
          {patient.allergies.slice(0, 3).map((allergy, idx) => (
            <AllergyBadge key={idx} allergy={allergy} />
          ))}
          {patient.allergies.length > 3 && (
            <span className="text-xs text-gray-500 flex items-center px-2">+{patient.allergies.length - 3} more</span>
          )}
        </div>
      )}
    </motion.div>
  );
};
