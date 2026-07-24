import { useParams, Link } from 'react-router-dom';
import { useGetTenantByIdQuery, useUpdateFeatureFlagsMutation } from './superAdminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ImpersonateButton } from '../../components/super-admin/ImpersonateButton';
import { Building2, ArrowLeft, Mail, MapPin, Phone, Globe, ShieldCheck, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const HospitalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: response, isLoading } = useGetTenantByIdQuery(id, { skip: !id });
  const [updateFeatures, { isLoading: isUpdating }] = useUpdateFeatureFlagsMutation();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" className="text-emerald-500" />
      </div>
    );
  }

  const tenant = response?.data;

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-semibold text-white">Hospital not found</h3>
        <p className="mt-1 text-sm text-slate-400">The hospital you are looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/super-admin/hospitals" className="text-sm font-medium text-emerald-500 hover:text-emerald-400">
            &larr; Back to hospitals
          </Link>
        </div>
      </div>
    );
  }

  const handleFeatureToggle = async (featureKey: string, currentValue: boolean) => {
    try {
      const updatedFeatures = { ...tenant.features, [featureKey]: !currentValue };
      await updateFeatures({ id, features: updatedFeatures }).unwrap();
      toast.success('Features updated successfully');
    } catch {
      toast.error('Failed to update features');
    }
  };

  const featureList = [
    { key: 'pharmacy', label: 'Pharmacy Module' },
    { key: 'laboratory', label: 'Laboratory Module' },
    { key: 'billing', label: 'Billing Module' },
    { key: 'telemedicine', label: 'Telemedicine' },
    { key: 'aiAssistant', label: 'AI Clinical Assistant' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to="/super-admin/hospitals" 
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            {tenant.name}
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                tenant.status === 'ACTIVE' 
                ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 ring-rose-500/20'
            }`}>
              {tenant.status}
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Tenant ID: {tenant._id} • Onboarded {format(new Date(tenant.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Hospital Information
            </h3>
            
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Subdomain
                </dt>
                <dd className="mt-1 text-sm text-slate-200">{tenant.slug}.medicalink.com</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Admin Email
                </dt>
                <dd className="mt-1 text-sm text-slate-200">{tenant.settings?.contactEmail || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone
                </dt>
                <dd className="mt-1 text-sm text-slate-200">{tenant.settings?.contactPhone || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Address
                </dt>
                <dd className="mt-1 text-sm text-slate-200">{tenant.settings?.address || 'Not set'}</dd>
              </div>
            </dl>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <h4 className="text-sm font-medium text-slate-400 mb-4">Localization Settings</h4>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6">
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase">Timezone</dt>
                  <dd className="mt-1 text-sm text-slate-200">{tenant.settings?.timezone || 'UTC'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase">Currency</dt>
                  <dd className="mt-1 text-sm text-slate-200">{tenant.settings?.currency || 'USD'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase">Language</dt>
                  <dd className="mt-1 text-sm text-slate-200">{tenant.settings?.language || 'en'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Usage Statistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <p className="mt-2 text-3xl font-bold text-white">42</p>
                <p className="mt-1 text-xs text-slate-400">Limit: 100</p>
                <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-sm font-medium text-slate-500">Storage Used</p>
                <p className="mt-2 text-3xl font-bold text-white">12 GB</p>
                <p className="mt-1 text-xs text-slate-400">Limit: 50 GB</p>
                <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-sm font-medium text-slate-500">Patients</p>
                <p className="mt-2 text-3xl font-bold text-white">1,248</p>
                <p className="mt-1 text-xs text-slate-400">Unlimited</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Controls */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-6">Subscription</h3>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
              <p className="text-sm font-medium text-emerald-400">Current Plan</p>
              <p className="mt-1 text-2xl font-bold text-white">{tenant.plan || 'PROFESSIONAL'}</p>
            </div>
            <button className="w-full justify-center rounded-xl bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-colors border border-slate-700">
              Change Plan
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Feature Flags
              </h3>
              {isUpdating && <LoadingSpinner size="sm" className="text-emerald-500" />}
            </div>
            <div className="space-y-4">
              {featureList.map((feature) => {
                const isEnabled = tenant.features?.[feature.key] || false;
                return (
                  <div key={feature.key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">{feature.label}</span>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleFeatureToggle(feature.key, isEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                        isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4">Super Admin Actions</h3>
            <div className="mb-3">
              <ImpersonateButton tenantId={id!} tenantName={tenant.name} className="w-full justify-center" />
            </div>
            <button className="w-full justify-center rounded-xl bg-transparent px-3 py-2.5 text-sm font-semibold text-rose-400 shadow-sm hover:bg-rose-500/10 transition-colors border border-rose-500/20">
              Suspend Hospital
            </button>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <Link 
                to={`/super-admin/audit?tenant=${id}`}
                className="w-full flex justify-center items-center rounded-xl bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-300 shadow-sm hover:bg-slate-700 transition-colors border border-slate-700"
              >
                View Activity Logs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
