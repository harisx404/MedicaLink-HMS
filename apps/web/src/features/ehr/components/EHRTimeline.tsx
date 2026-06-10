export const EHRTimeline = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Patient Timeline</h3>
      <div className="space-y-4">
        {/* Placeholder for timeline events */}
        <div className="border-l-2 border-primary pl-4 py-2 relative">
          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-3"></div>
          <p className="text-sm font-medium">Consultation Completed</p>
          <p className="text-xs text-muted-foreground">Today, 10:30 AM</p>
        </div>
      </div>
    </div>
  );
};

export const VitalSignsChart = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Vitals History</h3>
      <div className="h-64 flex items-center justify-center bg-muted/20 border border-dashed rounded-lg">
        <p className="text-sm text-muted-foreground">Chart data will appear here.</p>
      </div>
    </div>
  );
};
