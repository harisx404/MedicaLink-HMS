import { useState } from 'react';
import { useGetLeavesQuery, useApproveLeaveMutation } from '../api/hrApi';
import { LeaveStatus, type SharedLeave } from '@medicalink/shared';

export const LeaveManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const { data, isLoading } = useGetLeavesQuery({ status: statusFilter === 'ALL' ? undefined : statusFilter });
  const [approveLeave] = useApproveLeaveMutation();

  const handleAction = async (id: string, status: LeaveStatus) => {
    try {
      await approveLeave({ id, status, comment: 'Processed via HR Dashboard' }).unwrap();
    } catch (err) {
      console.error('Failed to process leave', err);
    }
  };

  const leaves = data?.data || [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>

      <div className="flex gap-4 mb-4">
        <select 
          className="border border-gray-300 rounded p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Requests</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave: SharedLeave) => {
                const emp = leave.employee as any;
                const user = emp?.userId;
                return (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName} <br/>
                      <span className="text-xs text-gray-500">{emp?.employeeId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.leaveType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(leave.fromDate).toLocaleDateString()} to {new Date(leave.toDate).toLocaleDateString()}
                      <br/>
                      <span className="text-xs font-semibold">{leave.totalDays} Days</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                          leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {leave.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAction(leave.id!, LeaveStatus.APPROVED)}
                            className="text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700 text-xs">
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(leave.id!, LeaveStatus.REJECTED)}
                            className="text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-xs">
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No leave requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
