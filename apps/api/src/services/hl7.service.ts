import { hl7 } from 'hl7-standard';
import { getPatientModel } from '../models/Patient';
import { getLabOrderModel } from '../models/LabOrder';
import { getRadiologyOrderModel } from '../models/RadiologyOrder';
import mongoose from 'mongoose';

/**
 * Service to process incoming HL7 v2 messages from external systems
 */
export class Hl7Service {
  
  /**
   * Process incoming raw HL7 string
   */
  static async processMessage(tenantDb: mongoose.Connection, tenantId: string, rawMessage: string) {
    const message = new hl7(rawMessage);
    message.transform(); // Builds the segment array
    
    const messageType = message.get('MSH.9.1');
    
    switch (messageType) {
      case 'ORU': // Observation Result
        return await this.processORU(tenantDb, tenantId, message);
      case 'ADT': // Admit, Discharge, Transfer
        // Usually handled by EMR, we can just log or sync it
        return { success: true, message: 'ADT message ignored or logged.' };
      default:
        throw new Error(`Unsupported HL7 Message Type: ${messageType}`);
    }
  }

  /**
   * Process ORU^R01 (Observation Result)
   * This is what a lab machine or external radiology clinic sends back.
   */
  private static async processORU(tenantDb: mongoose.Connection, tenantId: string, message: any) {
    // 1. Get Patient Identifier (PID segment)
    const patientIdentifier = message.get('PID.3.1'); // Usually the UHID
    
    // 2. Get Order Identifier (OBR segment)
    const orderIdentifier = message.get('OBR.2.1') || message.get('OBR.3.1'); // The LabOrder or RadOrder ID
    
    if (!patientIdentifier || !orderIdentifier) {
      throw new Error('Missing PID or OBR identifiers in HL7 message');
    }

    const Patient = getPatientModel(tenantDb);
    const patient = await Patient.findOne({ uhid: patientIdentifier, tenantId });
    if (!patient) {
      throw new Error(`Patient with UHID ${patientIdentifier} not found in tenant ${tenantId}`);
    }

    // Determine if it's a Lab Order or Radiology Order based on a prefix or querying both
    // For this example, we'll try Lab first, then Radiology.
    const LabOrder = getLabOrderModel(tenantDb);
    const labOrder = await LabOrder.findOne({ _id: orderIdentifier, tenantId, patient: patient._id });

    if (labOrder) {
      return await this.updateLabResults(labOrder, message);
    }

    const RadiologyOrder = getRadiologyOrderModel(tenantDb);
    const radOrder = await RadiologyOrder.findOne({ _id: orderIdentifier, tenantId, patient: patient._id });

    if (radOrder) {
      return await this.updateRadiologyResults(radOrder, message);
    }

    throw new Error(`No matching Lab or Radiology order found for ID ${orderIdentifier}`);
  }

  private static async updateLabResults(labOrder: any, message: any) {
    // OBX segments contain the results
    const obxSegments = message.getSegments('OBX');
    
    // Map HL7 results to the labOrder.results array
    const results = obxSegments.map((obx: any) => ({
      testName: obx.get('OBX.3.2'),
      value: obx.get('OBX.5.1'),
      unit: obx.get('OBX.6.1'),
      referenceRange: obx.get('OBX.7.1'),
      isAbnormal: obx.get('OBX.8.1') !== 'N', // N = Normal, H = High, L = Low
      remarks: obx.get('OBX.11.1') // Observation Result Status
    }));

    labOrder.results = results;
    labOrder.status = 'COMPLETED';
    labOrder.reportedDate = new Date();
    await labOrder.save();

    return { success: true, message: 'Lab order updated from HL7 message', orderId: labOrder._id };
  }

  private static async updateRadiologyResults(radOrder: any, message: any) {
    const obxSegments = message.getSegments('OBX');
    
    // Usually radiology ORU sends the report text in OBX.5
    let reportText = '';
    obxSegments.forEach((obx: any) => {
      reportText += obx.get('OBX.5.1') + '\n';
    });

    radOrder.report = {
      findings: reportText,
      conclusion: 'Auto-imported via HL7 interface.',
      reportedBy: radOrder.doctor // Fallback, normally we'd parse the parsing doctor from OBX.16
    };
    radOrder.status = 'COMPLETED';
    radOrder.reportedAt = new Date();
    
    await radOrder.save();
    return { success: true, message: 'Radiology order updated from HL7 message', orderId: radOrder._id };
  }
}
