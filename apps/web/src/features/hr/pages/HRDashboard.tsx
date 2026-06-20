import { useGetHRDashboardStatsQuery } from '../api/hrApi';
import { useHRPermissions } from '../hooks/useHRPermissions';

export const HRDashboard = () => {
  const { isHRAdmin } = useHRPermissions();
  const { data, isLoading, error } = useGetHRDashboardStatsQuery(undefined, { skip: !isHRAdmin });

  if (!isHRAdmin) {
    return <div className="p-6 text-center text-red-500">You do not have permission to view the HR Dashboard.</div>;
  }

  if (isLoading) return <div className="p-6">Loading HR Stats...</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load HR dashboard.</div>;

  const stats = data?.data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Staff</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalStaff || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Present Today</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{stats?.presentToday || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Pending Leave Requests</h3>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{stats?.pendingLeaves || 0}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <a href="/hr/employees" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Manage Employees</a>
          <a href="/hr/attendance" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Attendance Terminal</a>
          <a href="/hr/leaves" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Review Leaves</a>
          <a href="/hr/payroll" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Process Payroll</a>
        </div>
      </div>
    </div>
  );
};
