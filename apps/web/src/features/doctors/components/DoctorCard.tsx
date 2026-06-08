import React from 'react';
import { Link } from 'react-router-dom';
import type { SharedDoctor } from '@medicalink/shared';
import { SpecialtyBadge } from './SpecialtyBadge';
import { RatingStars } from './RatingStars';
import { AvailabilityStatus } from './AvailabilityStatus';
import { Calendar, User } from 'lucide-react';
import { Button } from '../../../components/ui';

interface DoctorCardProps {
  doctor: SharedDoctor;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const primarySpecialty = doctor.specializations.find((s) => s.isPrimary) || doctor.specializations[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
              {doctor.photo || doctor.user?.profileImage ? (
                <img
                  src={doctor.photo || doctor.user?.profileImage}
                  alt={`Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500">
                  <User size={24} />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                Dr. {doctor.user?.firstName} {doctor.user?.lastName}
              </h3>
              <p className="text-sm text-slate-500 mb-1">{doctor.qualifications.map(q => q.degree).join(', ')}</p>
              <RatingStars rating={doctor.avgRating} count={doctor.totalRatings} size={14} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {primarySpecialty && (
              <SpecialtyBadge specialty={primarySpecialty.specialty} isPrimary />
            )}
            <AvailabilityStatus status={doctor.currentStatus} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
            <div>
              <p className="text-slate-500">Experience</p>
              <p className="font-medium text-slate-900">{doctor.experience} Years</p>
            </div>
            <div>
              <p className="text-slate-500">Consultation Fee</p>
              <p className="font-medium text-slate-900">${doctor.consultationFee.opd}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
        <Link to={`/doctors/${doctor.id}`} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
          View Profile
        </Link>
        <Button variant="primary" size="sm" className="gap-2">
          <Calendar size={14} />
          Book Appointment
        </Button>
      </div>
    </div>
  );
};
