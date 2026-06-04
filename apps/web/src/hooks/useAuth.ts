import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../features/auth/authApi';
import { logout as logoutAction } from '../store/slices/authSlice';
import type { RootState } from '../store/store';
import { Role } from '@medicalink/shared';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [logoutApi] = useLogoutMutation();

  const logout = async () => {
    try {
      await logoutApi({}).unwrap();
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      dispatch(logoutAction());
    }
  };

  const hasRole = (role: Role): boolean => {
    return auth.user?.role === role;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.includes(auth.user?.role as Role);
  };

  const isSuperAdmin = (): boolean => {
    return auth.user?.role === Role.SUPER_ADMIN;
  };

  return {
    ...auth,
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    requires2FA: auth.requires2FA,
    tempUserId: auth.tempUserId,
    logout,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
  };
};
