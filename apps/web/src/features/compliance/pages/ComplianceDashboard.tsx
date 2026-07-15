import { useGetRequirementsQuery } from '../api/complianceApi';
import { ShieldAlert, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ComplianceStatus } from '@medicalink/shared';

export function ComplianceDashboard() {
  const { data: requirements = [], isLoading } = useGetRequirementsQuery();

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.COMPLIANT: return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
      case ComplianceStatus.NON_COMPLIANT: return 'text-rose-600 bg-rose-500/10 border-rose-500/20';
      case ComplianceStatus.IN_PROGRESS: return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.COMPLIANT: return <CheckCircle2 className="h-4 w-4" />;
      case ComplianceStatus.NON_COMPLIANT: return <AlertCircle className="h-4 w-4" />;
      case ComplianceStatus.IN_PROGRESS: return <Clock className="h-4 w-4" />;
      default: return <ShieldAlert className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Compliance Dashboard</h1>
          <p className="text-muted-foreground">HIPAA, GDPR, and global regulatory compliance status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Compliance Score', value: '86%', desc: 'Across all frameworks' },
          { label: 'Pending Audits', value: '3', desc: 'Due within 30 days' },
          { label: 'Critical Risks', value: '0', desc: 'Unresolved non-compliant items' },
          { label: 'Active Frameworks', value: '4', desc: 'HIPAA, GDPR, HL7, JCI' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-5 rounded-xl border border-border/50 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <h2 className="font-semibold text-lg">Regulatory Requirements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
              <tr>
                <th className="px-6 py-4 font-medium">Framework</th>
                <th className="px-6 py-4 font-medium">Category / Requirement</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Reviewed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading requirements...</td></tr>
              ) : requirements.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No compliance records found.</td></tr>
              ) : (
                requirements.map((req) => (
                  <tr key={req._id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-xs">
                        {req.framework}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{req.requirement}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{req.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${getStatusColor(req.status)}`}>
                        {getStatusIcon(req.status)}
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {req.lastReviewedAt ? new Date(req.lastReviewedAt).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
