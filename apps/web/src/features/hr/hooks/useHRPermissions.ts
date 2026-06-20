import { useAuth } from '../../../hooks/useAuth';
import { Role } from '@medicalink/shared';

export const useHRPermissions = () => {
  const { user } = useAuth();

  const isHRAdmin = user?.role === Role.SUPER_ADMIN || 
                    user?.role === Role.HOSPITAL_ADMIN || 
                    user?.role === Role.HR_MANAGER;

  // Any staff member (except maybe patients who are not staff anyway)
  const isStaff = user?.role !== Role.PATIENT;

  return {
    isHRAdmin,
    isStaff,
    canManageEmployees: isHRAdmin,
    canApproveLeave: isHRAdmin,
    canRunPayroll: isHRAdmin,
    canMarkAttendanceBulk: isHRAdmin,
    canViewAllAttendance: isHRAdmin,
    canViewAllLeaves: isHRAdmin,
  };
};
