import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SharedVitals } from '@medicalink/shared';

interface VitalsChartProps {
  data: SharedVitals[];
}

export const VitalsChart: React.FC<VitalsChartProps> = ({ data }) => {
  // Format data for Recharts
  const chartData = data.slice().reverse().map((vital) => ({
    time: new Date(vital.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pulse: vital.pulse || null,
    systolic: vital.bp?.systolic || null,
    diastolic: vital.bp?.diastolic || null,
    temp: vital.temp || null,
    spO2: vital.spO2 || null,
  }));

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-gray-500 text-sm">No vitals data available for this patient.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 font-jakarta">Vital Signs Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: '#6B7280' }} 
            axisLine={false} 
            tickLine={false} 
            dy={10} 
          />
          <YAxis 
            yAxisId="left" 
            tick={{ fontSize: 12, fill: '#6B7280' }} 
            axisLine={false} 
            tickLine={false} 
            domain={['auto', 'auto']}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fontSize: 12, fill: '#6B7280' }} 
            axisLine={false} 
            tickLine={false} 
            domain={[35, 42]}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="pulse" 
            stroke="#EF4444" 
            name="Heart Rate (bpm)"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="systolic" 
            stroke="#6366F1" 
            name="Systolic BP"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="temp" 
            stroke="#F59E0B" 
            name="Temperature (°C)"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
