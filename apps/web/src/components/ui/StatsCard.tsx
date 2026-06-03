import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "bg-card border border-border/50 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-primary p-2 bg-primary/10 rounded-lg">{icon}</div>}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold font-heading text-foreground">{value}</h3>
        {trend && (
          <span
            className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-emerald-500" : "text-destructive"
            )}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
