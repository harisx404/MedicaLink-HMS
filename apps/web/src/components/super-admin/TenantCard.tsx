import { Building2, Users, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TenantCardProps {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
}

export const TenantCard = ({ id, name, slug, plan, status }: TenantCardProps) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{name}</h3>
            <p className="text-xs text-slate-400">{slug}.medicalink.com</p>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset shrink-0 ${
            status === 'ACTIVE' 
            ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 ring-rose-500/20'
        }`}>
          {status}
        </span>
      </div>
      <div className="flex gap-4 mb-5 flex-1">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> 0 Users
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" /> {plan}
        </div>
      </div>
      <Link to={`/super-admin/hospitals/${id}`} className="w-full inline-flex justify-center items-center py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors">
        Manage Tenant
      </Link>
    </div>
  );
};
