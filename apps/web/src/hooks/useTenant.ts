import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export const useTenant = () => {
  const tenantSlug = useSelector((state: RootState) => state.auth.tenantSlug);

  // In the future, we can expand this to fetch full tenant features and settings 
  // via an RTK Query endpoint or store state once the hospital admin module is built.

  return {
    tenantSlug,
    // Add feature flags checks here later
    features: {
      pharmacy: true,
      lab: true,
      radiology: true,
      telemedicine: true,
      bloodBank: true,
      ai: true,
    },
  };
};
