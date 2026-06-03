import { Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
// Note: A full implementation would use a library like react-day-picker
// For Phase 0, this provides the UI shell according to the design system

interface DateRangePickerProps {
  className?: string;
  startDate?: Date;
  endDate?: Date;
  onChange?: (range: { start?: Date; end?: Date }) => void;
}

export function DateRangePicker({ className, startDate, endDate }: DateRangePickerProps) {
  return (
    <div className={cn("relative group", className)}>
      <button className="flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border/50 rounded-lg hover:bg-muted/50 transition-colors w-full sm:w-auto min-w-[200px] text-left">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className={cn("flex-1", !startDate && "text-muted-foreground")}>
          {startDate && endDate
            ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : 'Select date range'}
        </span>
      </button>
    </div>
  );
}
