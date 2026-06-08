import { useGetDashboardStatsQuery } from './hospitalAdminApi';
import { StatsCard } from '../../components/ui';
import { 
  Users, Bed, Activity, Loader2, 
  Stethoscope, Syringe, HeartPulse, ClipboardList, 
  DollarSign, FileText, FlaskConical, Pill
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

export function HospitalAdminDashboard() {
  const { data: response, isLoading } = useGetDashboardStatsQuery({});

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const stats = response?.data?.overview || {
    totalDepartments: 0,
    totalWards: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    bedOccupancyRate: 0,
    totalStaff: 0
  };

  const wardsOccupancy = response?.data?.wardsOccupancy || [];

  // Mock data for Phase 3 (Since Patients/Billing/Appointments are Phase 4 modules)
  const appointmentTrend = [
    { name: 'Mon', count: 120 }, { name: 'Tue', count: 140 },
    { name: 'Wed', count: 180 }, { name: 'Thu', count: 150 },
    { name: 'Fri', count: 190 }, { name: 'Sat', count: 90 },
    { name: 'Sun', count: 70 },
  ];

  const revenueExpense = [
    { name: 'Week 1', revenue: 45000, expense: 28000 },
    { name: 'Week 2', revenue: 52000, expense: 31000 },
    { name: 'Week 3', revenue: 48000, expense: 29000 },
    { name: 'Week 4', revenue: 61000, expense: 34000 },
  ];

  const deptLoad = [
    { name: 'Cardiology', count: 145 },
    { name: 'Orthopedics', count: 112 },
    { name: 'Pediatrics', count: 98 },
    { name: 'Neurology', count: 75 },
    { name: 'Oncology', count: 54 },
  ];

  const topDiagnoses = [
    { name: 'Hypertension', value: 400 },
    { name: 'Diabetes', value: 300 },
    { name: 'Viral Fever', value: 300 },
    { name: 'Asthma', value: 200 },
  ];
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  const activityFeed = [
    { id: 1, text: 'Dr. Sarah registered new patient John Doe', time: '5 mins ago', type: 'patient' },
    { id: 2, text: 'Payment of $500 received for Bill #1029', time: '12 mins ago', type: 'payment' },
    { id: 3, text: 'Emergency surgery scheduled in OT-1', time: '28 mins ago', type: 'clinical' },
    { id: 4, text: 'Lab results uploaded for Jane Smith', time: '45 mins ago', type: 'lab' },
    { id: 5, text: 'New admission in ICU Ward Bed #4', time: '1 hour ago', type: 'patient' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time overview of your hospital's operations and capacity.</p>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Patients Today" value="245" icon={<Users className="w-5 h-5 text-indigo-600" />} trend={{ value: 12, isPositive: true }} />
        <StatsCard title="OPD Patients" value="180" icon={<Stethoscope className="w-5 h-5 text-emerald-600" />} trend={{ value: 8, isPositive: true }} />
        <StatsCard title="IPD Patients" value="65" icon={<Bed className="w-5 h-5 text-blue-600" />} />
        <StatsCard title="Surgeries Today" value="14" icon={<Syringe className="w-5 h-5 text-rose-600" />} />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Available Beds" value={stats.availableBeds.toString()} icon={<Bed className="w-5 h-5 text-emerald-600" />} />
        <StatsCard title="Occupied Beds" value={stats.occupiedBeds.toString()} icon={<Activity className="w-5 h-5 text-rose-600" />} />
        <StatsCard title="Emergency Cases" value="28" icon={<HeartPulse className="w-5 h-5 text-rose-600" />} trend={{ value: 5, isPositive: false }} />
        <StatsCard title="Appointments Today" value="156" icon={<ClipboardList className="w-5 h-5 text-amber-600" />} />
      </div>

      {/* KPI Cards - Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Revenue Today" value="$12,450" icon={<DollarSign className="w-5 h-5 text-emerald-600" />} trend={{ value: 15, isPositive: true }} />
        <StatsCard title="Pharmacy Sales" value="$3,200" icon={<Pill className="w-5 h-5 text-indigo-600" />} />
        <StatsCard title="Lab Tests Ordered" value="89" icon={<FlaskConical className="w-5 h-5 text-purple-600" />} />
        <StatsCard title="Pending Bills" value="42" icon={<FileText className="w-5 h-5 text-amber-600" />} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* 1. Appointment Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Appointment Trend (Last 7 Days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Revenue vs Expense */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Revenue vs Expense (Last 30 Days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueExpense} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Department OPD Load */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Department OPD Load (Today)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptLoad} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Top Diagnoses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Top Diagnoses (This Month)</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topDiagnoses} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {topDiagnoses.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Real-time Activity Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-600" />
            Live Activity Feed
          </h3>
          <div className="space-y-6">
            {activityFeed.map((activity, idx) => (
              <div key={activity.id} className="flex relative">
                {idx !== activityFeed.length - 1 && (
                  <div className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></div>
                )}
                <div className="relative flex items-center justify-center w-8 h-8 bg-indigo-50 rounded-full flex-shrink-0 ring-4 ring-white">
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Bed Occupancy by Ward */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Ward Occupancy Breakdown</h3>
          <div className="h-[300px]">
            {wardsOccupancy.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardsOccupancy} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="wardCode" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="occupiedBeds" name="Occupied" stackId="a" fill="#4f46e5" radius={[0, 0, 4, 4]} barSize={30} />
                  <Bar dataKey="availableBeds" name="Available" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Bed className="w-12 h-12 text-slate-300 mb-3" />
                <p>No ward data available.</p>
                <p className="text-sm">Create wards and beds to see occupancy metrics.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
