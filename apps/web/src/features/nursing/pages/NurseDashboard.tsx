import React from 'react';
import { useGetPatientsQuery } from '../../patients/api/patientApi';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Users, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const NurseDashboard: React.FC = () => {
  // Using admitted patients for the ward (assuming query supports it, otherwise using generic list for demo)
  const { data: patientsData, isLoading } = useGetPatientsQuery({ limit: 10 });

  const patients = patientsData?.data || [];
  
  // Mock metrics for dashboard
  const metrics = [
    { name: 'Admitted Patients', value: '42', icon: Users, color: 'bg-indigo-500', trend: '+3' },
    { name: 'Critical (High NEWS)', value: '4', icon: AlertTriangle, color: 'bg-red-500', trend: '-1' },
    { name: 'Pending Vitals', value: '12', icon: Activity, color: 'bg-amber-500', trend: '+2' },
    { name: 'Completed MARs', value: '89%', icon: CheckCircle2, color: 'bg-teal-500', trend: '+4%' },
  ];

  return (
    <PageWrapper title="Nursing Dashboard">
      <div className="space-y-6 animate-fade-in">
        <p className="text-gray-500 mb-6">Ward overview and patient monitoring</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <motion.div 
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2 font-jakarta">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${metric.color} bg-opacity-10`}>
                <metric.icon className={`w-6 h-6 ${metric.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${metric.trend.startsWith('+') ? 'text-teal-600' : 'text-amber-600'}`}>
                {metric.trend}
              </span>
              <span className="text-gray-500 ml-2">vs last shift</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ward Patient List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 font-jakarta">My Ward Patients</h2>
          <Link 
            to="/nursing/handover"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
          >
            Shift Handover
          </Link>
        </div>
        
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UHID / Bed</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {patients.map((patient: any) => (
                  <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-700 font-medium text-sm">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                          <div className="text-sm text-gray-500">{patient.gender}, {patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'N/A'} yrs</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{patient.uhid}</div>
                      <div className="text-xs text-gray-500">Ward A / Bed 12</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Stable
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/nursing/patient/${patient.id}`} 
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors inline-block"
                      >
                        Chart Vitals / MAR
                      </Link>
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No admitted patients found in your ward.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </PageWrapper>
  );
};
