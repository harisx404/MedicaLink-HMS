import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRefreshMutation, useLazyGetMeQuery } from '../../features/auth/authApi';
import { setCredentials, logout } from '../../store/slices/authSlice';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const dispatch = useDispatch();
  const [refresh] = useRefreshMutation();
  const [getMe] = useLazyGetMeQuery();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to refresh the token using the httpOnly cookie
        const refreshResult = await refresh({}).unwrap();
        
        if (refreshResult.data?.accessToken) {
          // If successful, we have an access token but we need the user object
          // We can temporarily set the token so the next request uses it
          dispatch(
            setCredentials({
              user: null as any, // Temp, will override shortly
              token: refreshResult.data.accessToken,
            })
          );

          // Fetch user details
          const userResult = await getMe({}).unwrap();
          
          if (userResult.data) {
             dispatch(
               setCredentials({
                 user: userResult.data,
                 token: refreshResult.data.accessToken,
               })
             );
          } else {
            dispatch(logout());
          }
        }
      } catch (error) {
        // Silent fail (user is not logged in or token expired)
        dispatch(logout());
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch, refresh, getMe]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" className="text-primary-600" />
      </div>
    );
  }

  return <>{children}</>;
};
