import { useState } from 'react';
import { Check, X, Users, HardDrive, Zap, Building2, ChevronRight } from 'lucide-react';
import { useGetTenantsQuery, useUpdateTenantMutation } from './superAdminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Basic',
    price: '$299',
    description: 'Perfect for small clinics and solo practices.',
    limits: { users: 10, storage: '10 GB', api: '10,000/mo' },
    features: [
      { name: 'Up to 10 Users', included: true },
      { name: 'Patient Management', included: true },
      { name: 'Appointment Scheduling', included: true },
      { name: 'Billing & Invoicing', included: true },
      { name: 'Pharmacy Module', included: false },
      { name: 'Laboratory Module', included: false },
      { name: 'Telemedicine', included: false },
      { name: 'AI Clinical Assistant', included: false },
    ]
  },
  {
    name: 'Professional',
    price: '$799',
    description: 'For mid-sized hospitals and multi-specialty clinics.',
    popular: true,
    limits: { users: 50, storage: '100 GB', api: '100,000/mo' },
    features: [
      { name: 'Up to 50 Users', included: true },
      { name: 'Patient Management', included: true },
      { name: 'Appointment Scheduling', included: true },
      { name: 'Billing & Invoicing', included: true },
      { name: 'Pharmacy Module', included: true },
      { name: 'Laboratory Module', included: true },
      { name: 'Telemedicine', included: false },
      { name: 'AI Clinical Assistant', included: false },
    ]
  },
  {
    name: 'Enterprise',
    price: '$1,999',
    description: 'Full suite for large hospitals and healthcare networks.',
    limits: { users: 'Unlimited', storage: '1 TB', api: 'Unlimited' },
    features: [
      { name: 'Unlimited Users', included: true },
      { name: 'Patient Management', included: true },
      { name: 'Appointment Scheduling', included: true },
      { name: 'Billing & Invoicing', included: true },
      { name: 'Pharmacy Module', included: true },
      { name: 'Laboratory Module', included: true },
      { name: 'Telemedicine', included: true },
      { name: 'AI Clinical Assistant', included: true },
    ]
  }
];

export const SubscriptionPlans = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { data: response, isLoading } = useGetTenantsQuery({});
  const [updateTenant, { isLoading: isUpdating }] = useUpdateTenantMutation();

  const tenants = response?.data || [];

  const handlePlanChange = async (tenantId: string, newPlan: string) => {
    try {
      await updateTenant({ id: tenantId, data: { plan: newPlan } }).unwrap();
      toast.success(`Plan updated to ${newPlan}`);
    } catch (err) {
      toast.error('Failed to update plan');
    }
  };

  const getPrice = (priceStr: string) => {
    if (priceStr === '$299') return isAnnual ? '$239' : priceStr;
    if (priceStr === '$799') return isAnnual ? '$639' : priceStr;
    if (priceStr === '$1,999') return isAnnual ? '$1,599' : priceStr;
    return priceStr;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscription Plans</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage pricing tiers and module access for hospitals.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              !isAnnual ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              isAnnual ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Annually <span className="ml-1 text-xs text-emerald-500 font-bold">-20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative flex flex-col rounded-3xl p-8 shadow-xl ${
              plan.popular 
                ? 'bg-slate-800 border-2 border-emerald-500' 
                : 'bg-slate-900 border border-slate-800'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-emerald-500 px-3 py-1 text-center text-xs font-semibold text-white">
                Most Popular
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-x-2">
                <span className="text-4xl font-bold tracking-tight text-white">{getPrice(plan.price)}</span>
                <span className="text-sm font-semibold leading-6 text-slate-400">/month</span>
              </div>
              {isAnnual && (
                <p className="mt-1 text-xs text-emerald-500 font-medium">Billed annually</p>
              )}
            </div>

            <div className="mb-6 pb-6 border-b border-slate-800 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Users className="w-4 h-4 text-slate-500" />
                <span><strong className="text-white">{plan.limits.users}</strong> Max Users</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <HardDrive className="w-4 h-4 text-slate-500" />
                <span><strong className="text-white">{plan.limits.storage}</strong> Storage</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Zap className="w-4 h-4 text-slate-500" />
                <span><strong className="text-white">{plan.limits.api}</strong> API Calls</span>
              </div>
            </div>

            <ul className="mb-8 space-y-4 flex-1">
              {plan.features.map((feature) => (
                <li key={feature.name} className="flex items-center gap-3">
                  {feature.included ? (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                      <X className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                  )}
                  <span className={`text-sm ${feature.included ? 'text-slate-300' : 'text-slate-500 line-through'}`}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <button className={`w-full rounded-xl px-3 py-3 text-sm font-semibold shadow-sm transition-colors ${
              plan.popular
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}>
              Edit Plan Limits
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-12 border-t border-slate-800">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white">Hospital Plan Assignments</h2>
          <p className="mt-1 text-sm text-slate-400">
            Directly assign or override subscription tiers for specific hospitals.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 flex justify-center"><LoadingSpinner className="text-emerald-500" /></div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {tenants.map((tenant: any) => (
                <li key={tenant._id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tenant.name}</p>
                      <p className="text-xs text-slate-500">{tenant.slug}.medicalink.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={tenant.plan || 'TRIAL'}
                      onChange={(e) => handlePlanChange(tenant._id, e.target.value)}
                      disabled={isUpdating}
                      className="block w-40 rounded-lg border-0 bg-slate-950 py-1.5 pl-3 pr-10 text-slate-300 ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6"
                    >
                      <option value="TRIAL">Trial</option>
                      <option value="BASIC">Basic</option>
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
