import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Props {
  data: { mode: string; amount: number; count: number }[];
  height?: number;
}

const COLORS: Record<string, string> = {
  CASH: '#10b981',      // Emerald
  CARD: '#3b82f6',      // Blue
  UPI: '#8b5cf6',       // Violet
  INSURANCE: '#f59e0b', // Amber
  NEFT: '#06b6d4',      // Cyan
  WALLET: '#ec4899',    // Pink
  CREDIT: '#ef4444'     // Red
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-bold text-slate-900 mb-1">{data.name}</p>
        <p className="text-sm text-slate-600">₹{data.value.toLocaleString('en-IN')}</p>
        <p className="text-xs text-slate-400 mt-1">{data.count} transactions</p>
      </div>
    );
  }
  return null;
};

export const PaymentModePieChart: React.FC<Props> = ({ data, height = 300 }) => {
  const chartData = data.map(item => ({
    name: item.mode,
    value: item.amount,
    count: item.count
  })).filter(d => d.value > 0);

  // Custom legend to show percentages
  const renderLegend = (props: any) => {
    const { payload } = props;
    const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

    return (
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
        {payload.map((entry: any, index: number) => {
          const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0;
          return (
            <li key={`item-${index}`} className="flex items-center text-sm">
              <span 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="text-slate-600 font-medium mr-1">{entry.value}</span>
              <span className="text-slate-400 text-xs">({percent}%)</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div style={{ width: '100%', height }}>
      {chartData.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
          No payment data available
        </div>
      ) : (
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
