import mongoose from 'mongoose';
import { getLabResultModel } from '../models/LabResult';
import { getTestCatalogModel } from '../models/TestCatalog';

/**
 * Service to handle smart laboratory features: Delta checks, TAT monitoring, Auto-reporting
 */
export class LabService {
  /**
   * Performs a delta check by comparing current results against previous results for the same patient and test.
   * Helps flag potentially erroneous results or significant clinical changes.
   */
  static async performDeltaCheck(tenantId: string, patientId: string, testId: string, newParameters: any[]) {
    try {
      const LabResult = getLabResultModel(mongoose.connection);
      
      // Find the most recent verified result for this patient and test
      const previousResult = await LabResult.findOne({
        tenantId,
        test: testId,
        status: { $in: ['VERIFIED', 'REPORTED'] }
      })
      .populate({
        path: 'labOrder',
        match: { patient: patientId }
      })
      .sort({ createdAt: -1 });

      if (!previousResult || !previousResult.labOrder) {
        return { hasDeltaCheck: false, deltaWarning: null };
      }

      let deltaWarning = '';
      let hasDeltaCheck = false;

      // Compare numeric parameters
      newParameters.forEach(newParam => {
        const oldParam = previousResult.parameters.find(p => p.name === newParam.name);
        
        if (oldParam && !isNaN(Number(newParam.value)) && !isNaN(Number(oldParam.value))) {
          const newVal = Number(newParam.value);
          const oldVal = Number(oldParam.value);
          
          if (oldVal !== 0) {
            const percentChange = Math.abs((newVal - oldVal) / oldVal) * 100;
            
            // Standard delta check threshold (e.g., 50% change)
            if (percentChange > 50) {
              hasDeltaCheck = true;
              deltaWarning += `${newParam.name} changed by ${percentChange.toFixed(1)}% (Prev: ${oldVal}, New: ${newVal}). `;
            }
          }
        }
      });

      return { hasDeltaCheck, deltaWarning };
    } catch (error) {
      console.error('Error performing delta check:', error);
      return { hasDeltaCheck: false, deltaWarning: null };
    }
  }

  /**
   * Generates a PDF report for a verified lab result.
   */
  static async generateReport(tenantId: string, labResultId: string) {
    // In a real implementation, this would use puppeteer or pdfkit to generate a PDF
    // based on the result data and upload it to S3/Cloud Storage, returning the URL.
    
    // For now, we simulate the process
    return `https://storage.medicalink.app/${tenantId}/lab-reports/${labResultId}.pdf`;
  }

  /**
   * Monitors Turn-Around-Time (TAT) and returns metrics.
   */
  static async checkTatBreaches(tenantId: string) {
    const LabOrder = mongoose.model('LabOrder'); // Assuming model exists in connection
    const TestCatalog = getTestCatalogModel(mongoose.connection);
    
    // Logic to find orders where (currentTime - orderedAt) > TestCatalog.turnaroundTime
    // This would typically be run as a cron job and send alerts
    return [];
  }
}
