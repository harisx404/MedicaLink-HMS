import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface Props {
  title: string;
  value: string | number;
  trend?: number; // percentage, positive or negative
  trendLabel?: string;
  icon?: React.ReactNode;
  chartData?: any[];
  chartDataKey?: string;
  chartColor?: string;
}

export const MetricCard: React.FC<Props> = ({ 
  title, 
  value, 
  trend, 
  trendLabel, 
  icon, 
  chartData, 
  chartDataKey, 
  chartColor = '#6366f1' 
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between mt-auto">
        {trend !== undefined && (
          <div className="flex items-center text-sm">
            <span className={`flex items-center font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(trend)}%
            </span>
            {trendLabel && <span className="text-gray-400 ml-2 text-xs">{trendLabel}</span>}
          </div>
        )}

        {chartData && chartDataKey && (
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey={chartDataKey} stroke={chartColor} fillOpacity={1} fill={`url(#color-${title})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
