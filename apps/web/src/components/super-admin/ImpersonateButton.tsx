import { useImpersonateTenantMutation } from '../../features/super-admin/superAdminApi';
import { LogIn, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

interface ImpersonateButtonProps {
  tenantId: string;
  tenantName: string;
  className?: string;
}

export const ImpersonateButton = ({ tenantId, tenantName, className = '' }: ImpersonateButtonProps) => {
  const [impersonate, { isLoading }] = useImpersonateTenantMutation();
  const dispatch = useDispatch();

  const handleImpersonate = async () => {
    try {
      const response = await impersonate(tenantId).unwrap();
      
      dispatch(setCredentials({
        user: response.data.user,
        token: response.data.accessToken
      }));

      toast.success(`Now impersonating admin for ${tenantName}`);
      
      // Force reload to completely reset app state with new token
      window.location.href = `/?tenant=${response.data.tenantSlug}`;
      
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to impersonate admin');
    }
  };

  return (
    <button
      onClick={handleImpersonate}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Login as Admin"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
      <span>Login as Admin</span>
    </button>
  );
};
