import { useState } from 'react';
import { useGetPayrollsQuery, useGeneratePayrollDraftMutation, useApprovePayrollMutation, useGetEmployeesQuery } from '../api/hrApi';
import { PayrollStatus, type SharedPayroll, type SharedEmployee } from '@medicalink/shared';

export const PayrollProcessing = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const { data: employeesData } = useGetEmployeesQuery({});
  const { data: payrollsData, isLoading } = useGetPayrollsQuery({ month, year });
  
  const [generateDraft] = useGeneratePayrollDraftMutation();
  const [approvePayroll] = useApprovePayrollMutation();

  const handleGenerate = async () => {
    if (!selectedEmployeeId) {
      alert('Please select an employee');
      return;
    }
    try {
      await generateDraft({ employeeId: selectedEmployeeId, month, year }).unwrap();
      setSelectedEmployeeId('');
    } catch (err) {
      console.error('Failed to generate draft', err);
      alert((err as any)?.data?.message || 'Failed to generate payroll draft');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approvePayroll(id).unwrap();
    } catch (err) {
      console.error('Failed to approve', err);
    }
  };

  const employees = employeesData?.data || [];
  const payrolls = payrollsData?.data || [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payroll Processing</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium mb-4">Generate Payroll</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select className="border border-gray-300 rounded p-2" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input type="number" className="border border-gray-300 rounded p-2 w-24" value={year} onChange={e => setYear(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select className="border border-gray-300 rounded p-2" value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}>
              <option value="">Select Employee</option>
              {employees.map((emp: SharedEmployee) => (
                <option key={emp.id} value={emp.id}>{(emp.userId as any)?.firstName} {(emp.userId as any)?.lastName} - {emp.employeeId}</option>
              ))}
            </select>
          </div>
          <button onClick={handleGenerate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Generate Draft
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrolls.map((payroll: SharedPayroll) => {
                const emp = payroll.employee as any;
                const user = emp?.userId;
                return (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName} <br/>
                      <span className="text-xs text-gray-500">{emp?.employeeId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{payroll.grossPay.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">₹{payroll.totalDeductions.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{payroll.netPay.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${payroll.status === PayrollStatus.APPROVED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payroll.status === PayrollStatus.DRAFT && (
                        <button 
                          onClick={() => handleApprove(payroll.id!)}
                          className="text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700 text-xs">
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {payrolls.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No payroll records found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
