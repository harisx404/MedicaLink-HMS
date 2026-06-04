import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCreateTenantMutation, useGetTenantByIdQuery, useUpdateTenantMutation } from './superAdminApi';
import { Building2, ArrowLeft, Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const tenantSchema = z.object({
  name: z.string().min(2, 'Hospital name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  logoUrl: z.string().optional(),
  plan: z.enum(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  settings: z.object({
    contactEmail: z.string().email('Invalid email address'),
    contactPhone: z.string().min(5, 'Phone is required'),
    address: z.string().min(5, 'Address is required'),
    timezone: z.string(),
    currency: z.string()
  })
});

type TenantFormValues = z.infer<typeof tenantSchema>;

export const HospitalForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  
  const { data: tenantData } = useGetTenantByIdQuery(id, { skip: !isEditMode });
  const [createTenant, { isLoading: isCreating }] = useCreateTenantMutation();
  const [updateTenant, { isLoading: isUpdating }] = useUpdateTenantMutation();

  const isLoading = isCreating || isUpdating;

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      plan: 'PROFESSIONAL',
      settings: {
        timezone: 'UTC',
        currency: 'USD'
      }
    }
  });

  // Auto-generate slug from name if user hasn't touched it (only in create mode)
  const name = watch('name');
  useEffect(() => {
    if (name && !isEditMode) {
      const suggestedSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setValue('slug', suggestedSlug, { shouldValidate: true });
    }
  }, [name, setValue, isEditMode]);

  useEffect(() => {
    if (isEditMode && tenantData?.data) {
      const t = tenantData.data;
      reset({
        name: t.name,
        slug: t.slug,
        plan: t.plan,
        logoUrl: t.logoUrl,
        settings: {
          contactEmail: t.settings?.contactEmail || t.adminEmail,
          contactPhone: t.settings?.contactPhone || t.phone || '',
          address: t.settings?.address || '',
          timezone: t.settings?.timezone || 'UTC',
          currency: t.settings?.currency || 'USD',
        }
      });
    }
  }, [isEditMode, tenantData, reset]);

  const onSubmit = async (data: TenantFormValues) => {
    try {
      if (isEditMode) {
        await updateTenant({ id, ...data }).unwrap();
        toast.success('Hospital updated successfully!');
        navigate(`/super-admin/hospitals/${id}`);
      } else {
        if (!data.password) {
          toast.error('Admin password is required for new hospitals');
          return;
        }
        const result = await createTenant({
          ...data,
          status: 'ACTIVE',
          features: {
            pharmacy: data.plan !== 'BASIC',
            laboratory: data.plan !== 'BASIC',
            billing: true,
            telemedicine: data.plan === 'ENTERPRISE',
            aiAssistant: data.plan === 'ENTERPRISE'
          }
        }).unwrap();
        
        toast.success('Hospital onboarded successfully!');
        navigate(`/super-admin/hospitals/${result.data._id}`);
      }
    } catch (err: any) {
      const errorMsg = err?.data?.message || `Failed to ${isEditMode ? 'update' : 'onboard'} hospital`;
      toast.error(errorMsg);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to="/super-admin/hospitals" 
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            {isEditMode ? 'Edit Hospital' : 'Onboard New Hospital'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isEditMode ? 'Update hospital details and configuration' : 'Create a new tenant workspace for a hospital'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <Building2 className="w-5 h-5 text-emerald-400" />
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300">Hospital Name</label>
              <input
                {...register('name')}
                type="text"
                className="mt-2 block w-full rounded-xl border-0 bg-slate-950 py-2.5 px-3 text-slate-200 ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                placeholder="City General Hospital"
              />
              {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Subdomain Slug</label>
              <div className="mt-2 flex rounded-xl shadow-sm">
                <input
                  {...register('slug')}
                  type="text"
                  className="block w-full min-w-0 flex-1 rounded-none rounded-l-xl border-0 bg-slate-950 py-2.5 px-3 text-slate-200 ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                  placeholder="city-general"
                />
                <span className="inline-flex items-center rounded-r-xl border border-l-0 border-slate-800 bg-slate-900 px-3 text-slate-500 sm:text-sm">
                  .medicalink.com
                </span>
              </div>
              {errors.slug && <p className="mt-1 text-sm text-rose-400">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Subscription Plan</label>
              <select
                {...register('plan')}
                className="mt-2 block w-full rounded-xl border-0 bg-slate-950 py-2.5 px-3 text-slate-200 ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-emerald-500 sm:text-sm"
              >
                <option value="BASIC">Basic</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-4 p-4 border border-slate-800 rounded-xl bg-slate-950/50">
              <div className="h-16 w-16 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                {watch('logoUrl') ? (
                  <img src={watch('logoUrl')} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-slate-500" />
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300">Logo URL</label>
                <div className="mt-2 flex shadow-sm rounded-xl">
                  <input
                    {...register('logoUrl')}
                    type="url"
                    placeholder="https://example.com/logo.png"
                    className="block w-full min-w-0 flex-1 rounded-xl border-0 bg-slate-950 py-2.5 px-3 text-slate-200 ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Provide a URL for the hospital logo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            Contact & Localization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300">Admin Email</label>
              <input
                {...register('settings.contactEmail')}
                type="email"
                className="mt-2 block w-full rounded-xl border-0 bg-slate-950 py-2.5 px-3 text-slate-200 ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                placeholder="admin@citygeneral.com"
              />
              {errors.settings?.contactEmail && <p className="mt-1 text-sm text-rose-400">{errors.settings.contactEmail.message}</p>}
            </div>

            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-slate-300">Admin Password</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    className="block w-full rounded-xl border-0 bg-slate-950 py-2.5 pl-10 pr-3 text-slate-200 ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                    placeholder="Super secure password"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300">Admin Phone</label>
              <input
                {...register('settings.contactPhone')}
                type="text"
                className="mt-2 block w-full rounded-xl border-0 bg-slate-950 py-2.5 px-3 text-slate-200 ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300">Hospital Address</label>
              <input
                {...register('settings.address')}
                type="text"
                className="mt-2 block w-full rounded-xl border-0 bg-slate-950 py-2.5 px-3 text-slate-200 ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                placeholder="123 Health Ave, City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Timezone</label>
              <select
                {...register('settings.timezone')}
                className="mt-2 block w-full rounded-xl border-0 bg-slate-950 py-2.5 px-3 text-slate-200 ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-emerald-500 sm:text-sm"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London</option>
                <option value="Asia/Dubai">Dubai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Currency</label>
              <select
                {...register('settings.currency')}
                className="mt-2 block w-full rounded-xl border-0 bg-slate-950 py-2.5 px-3 text-slate-200 ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-emerald-500 sm:text-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            to="/super-admin/hospitals"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Onboard Hospital')}
          </button>
        </div>
      </form>
    </div>
  );
};
