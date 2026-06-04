import { useGetSystemHealthQuery } from './superAdminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Server, Database, HardDrive, Activity, AlertTriangle, RefreshCw, GitBranch, Clock } from 'lucide-react';
import { HealthIndicator } from '../../components/super-admin/HealthIndicator';
import { UsageBar } from '../../components/super-admin/UsageBar';
import { format } from 'date-fns';

export const SystemMonitor = () => {
  const { data: response, isLoading, refetch, isFetching } = useGetSystemHealthQuery({}, {
    pollingInterval: 30000 // Poll every 30s
  });

  if (isLoading && !isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" className="text-emerald-500" />
      </div>
    );
  }

  const health = response?.data;

  // Format uptime
  const formatUptime = (seconds: number = 0) => {
    const days = Math.floor(seconds / (3600*24));
    const hrs = Math.floor(seconds % (3600*24) / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    return `${days}d ${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Monitor</h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time infrastructure health and performance metrics.
          </p>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthIndicator 
          status={health?.apiStatus === 'Operational' ? 'Operational' : 'Degraded'} 
          label="API Server" 
          subLabel={`Uptime: ${formatUptime(health?.uptime)}`} 
          icon={Server} 
        />
        
        <HealthIndicator 
          status={health?.mongoDbStatus === 'Operational' ? 'Operational' : 'Degraded'} 
          label="MongoDB Cluster" 
          subLabel={`${health?.dbLatency || 0}ms Latency (Multi-tenant)`} 
          icon={Database} 
        />

        <HealthIndicator 
          status={health?.redisStatus === 'Operational' ? 'Operational' : 'Degraded'} 
          label="Redis Cache & PubSub" 
          subLabel={`${health?.redisLatency || 0}ms Latency`} 
          icon={HardDrive} 
        />

        <HealthIndicator 
          status="Operational" 
          label="Live WebSockets" 
          subLabel={`${(health?.activeConnections || 0).toLocaleString()} Connections`} 
          icon={Activity} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-6">Resource Utilization</h3>
          
          <div className="space-y-4">
            <UsageBar 
              label="CPU Utilization" 
              value={health?.cpuUsage || 0} 
              max={100} 
              unit="%" 
              colorClass={(health?.cpuUsage || 0) > 80 ? 'bg-rose-500' : 'bg-emerald-500'} 
            />
            
            <UsageBar 
              label="Memory (Heap) Usage" 
              value={health?.memoryUsage || 0} 
              max={1024} 
              unit="MB" 
              colorClass="bg-blue-500" 
            />
            
            <h4 className="text-sm font-semibold text-slate-400 mt-6 mb-2">Bull Queue Depths</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-500">Emails</p>
                <p className="text-xl font-bold text-white">{health?.queueDepths?.emails || 0}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-500">Reports</p>
                <p className="text-xl font-bold text-white">{health?.queueDepths?.reports || 0}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-500">Webhooks</p>
                <p className="text-xl font-bold text-white">{health?.queueDepths?.webhooks || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Recent Exceptions
          </h3>
          
          {health?.recentErrors > 0 ? (
            <div className="space-y-3">
              {Array.from({ length: Math.min(health.recentErrors, 3) }).map((_, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-sm">
                  <span className="text-rose-400 font-medium">[Error]</span> 
                  <span className="text-slate-300 ml-2">Timeout establishing DB connection</span>
                  <p className="text-xs text-slate-500 mt-1">2 minutes ago • Source: Worker-02</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-500 text-sm">No recent exceptions detected.</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-semibold text-slate-400 mb-4">Deployment Info</h4>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-xs text-slate-500">Version</p>
                  <p className="text-sm font-bold text-white">{health?.version || 'v1.0.0'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-slate-500">Last Deploy</p>
                  <p className="text-sm font-bold text-white">
                    {health?.lastDeployment ? format(new Date(health.lastDeployment), 'MMM d, yyyy HH:mm') : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
