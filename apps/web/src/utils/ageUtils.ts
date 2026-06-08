import { differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';

/**
 * Calculates a precise age string handling newborns according to the blueprint.
 * @param dateOfBirth The patient's date of birth
 * @returns Formatted age string (e.g. "45 yrs", "3 mos", "14 days")
 */
export const formatPatientAge = (dateOfBirth: Date | string): string => {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const now = new Date();

  const years = differenceInYears(now, dob);
  
  if (years > 0) {
    return `${years} yrs`;
  }

  const months = differenceInMonths(now, dob);
  
  if (months > 0) {
    return `${months} mos`;
  }

  const days = Math.max(0, differenceInDays(now, dob));
  return `${days} days`;
};
