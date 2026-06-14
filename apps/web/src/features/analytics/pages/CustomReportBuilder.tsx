import React, { useState } from 'react';
import { PageHeader } from '../../../components/common';
import { Button } from '../../../components/ui/Button';
import { useGenerateCustomReportMutation } from '../api/analyticsApi';
import { AnalyticsNavigation } from '../components/AnalyticsNavigation';
import { Download, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CustomReportBuilder: React.FC = () => {
  const [generateReport, { isLoading }] = useGenerateCustomReportMutation();
  const [reportConfig, setReportConfig] = useState({
    module: 'BILLING',
    dateRange: 'LAST_30_DAYS',
    format: 'EXCEL'
  });

  const handleGenerate = async () => {
    try {
      await generateReport(reportConfig).unwrap();
      // Since it's a mock endpoint, we simulate download success
      toast.success(`Report generated and downloaded as ${reportConfig.format}`);
    } catch (e) {
      toast.error('Failed to generate report');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Custom Report Builder" 
        description="Build and export customized data reports"
      />
      <AnalyticsNavigation />

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Data Module</label>
            <select 
              className="w-full h-10 px-3 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              value={reportConfig.module}
              onChange={(e) => setReportConfig({ ...reportConfig, module: e.target.value })}
            >
              <option value="BILLING">Billing & Revenue</option>
              <option value="CLINICAL">Clinical & Diagnoses</option>
              <option value="PATIENT">Patient Demographics</option>
              <option value="PHARMACY">Pharmacy Inventory & Sales</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <select 
              className="w-full h-10 px-3 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              value={reportConfig.dateRange}
              onChange={(e) => setReportConfig({ ...reportConfig, dateRange: e.target.value })}
            >
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="THIS_YEAR">This Year</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Export Format</label>
            <select 
              className="w-full h-10 px-3 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              value={reportConfig.format}
              onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value })}
            >
              <option value="EXCEL">Excel (.xlsx)</option>
              <option value="PDF">PDF Document</option>
              <option value="CSV">CSV Data</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="outline" className="text-gray-600">
            <FileText className="h-4 w-4 mr-2" />
            Preview Data
          </Button>
          <Button onClick={handleGenerate} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Generate & Export
          </Button>
        </div>
      </div>
    </div>
  );
};
