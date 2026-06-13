import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { IRevenueTrend } from '@medicalink/shared';

interface Props {
  data: IRevenueTrend[];
  height?: number;
}

export const RevenueLineChart: React.FC<Props> = ({ data, height = 300 }) => {
  const formatYAxis = (tickItem: number) => {
    if (tickItem === 0) return '0';
    if (tickItem >= 1000000) return `₹${(tickItem / 1000000).toFixed(1)}M`;
    if (tickItem >= 1000) return `₹${(tickItem / 1000).toFixed(1)}k`;
    return `₹${tickItem}`;
  };

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="text-sm text-slate-500 mb-1">{formatXAxis(label)}</p>
          <p className="text-lg font-bold text-indigo-600">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
