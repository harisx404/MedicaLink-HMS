import mongoose, { Connection } from 'mongoose';
import { getRadiologyOrderModel } from '../models/RadiologyOrder';
import { getRadiologyReportModel } from '../models/RadiologyReport';
import { getDicomStudyModel } from '../models/DicomStudy';
import { AppError } from '../middlewares/errorHandler';

export class RadiologyService {
  
  // --- Orders ---
  static async createOrder(connection: Connection, tenantId: string, data: any) {
    const Order = getRadiologyOrderModel(connection) as mongoose.Model<any>;
    const orderNumber = `RAD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const order = new Order({
      ...data,
      tenantId,
      orderNumber,
      status: 'ORDERED'
    });
    
    await order.save();
    return order;
  }

  static async getOrders(connection: Connection, tenantId: string, query: any) {
    const Order = getRadiologyOrderModel(connection) as mongoose.Model<any>;
    const filter: any = { tenantId };
    
    if (query.status) filter.status = query.status;
    if (query.modality) filter.modality = query.modality;
    if (query.urgency) filter.urgency = query.urgency;
    if (query.patient) filter.patient = query.patient;
    
    return Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('patient', 'firstName lastName uhid gender dateOfBirth')
      .populate('doctor', 'firstName lastName');
  }

  static async getOrderById(connection: Connection, tenantId: string, orderId: string) {
    const Order = getRadiologyOrderModel(connection) as mongoose.Model<any>;
    const order = await Order.findOne({ _id: orderId, tenantId })
      .populate('patient', 'firstName lastName uhid gender dateOfBirth')
      .populate('doctor', 'firstName lastName')
      .populate('technician', 'firstName lastName')
      .populate('radiologist', 'firstName lastName');
      
    if (!order) throw new AppError('Radiology order not found', 404);
    return order;
  }

  static async updateOrderStatus(connection: Connection, tenantId: string, orderId: string, status: string, userId?: string) {
    const Order = getRadiologyOrderModel(connection) as mongoose.Model<any>;
    const order = await Order.findOne({ _id: orderId, tenantId });
    
    if (!order) throw new AppError('Radiology order not found', 404);
    
    order.status = status;
    
    if (status === 'IN_PROGRESS' || status === 'IMAGES_UPLOADED') {
      if (userId) order.technician = userId;
    }
    if (status === 'VERIFIED' && userId) {
      order.radiologist = userId;
      order.completedAt = new Date();
    }
    
    await order.save();
    return order;
  }

  // --- DICOM Studies ---
  static async uploadDicomStudy(connection: Connection, tenantId: string, orderId: string, data: any) {
    const Study = getDicomStudyModel(connection) as mongoose.Model<any>;
    const Order = getRadiologyOrderModel(connection) as mongoose.Model<any>;
    
    const order = await Order.findOne({ _id: orderId, tenantId });
    if (!order) throw new AppError('Radiology order not found', 404);

    const study = new Study({
      ...data,
      tenantId,
      orderId,
      patientId: order.patient,
      studyInstanceUID: data.studyInstanceUID || `1.2.826.0.1.3680043.8.498.${Date.now()}`,
      modality: order.modality,
      studyDate: new Date(),
      uploadedAt: new Date()
    });
    
    await study.save();
    
    order.status = 'IMAGES_UPLOADED';
    await order.save();
    
    return study;
  }

  static async getStudyByOrderId(connection: Connection, tenantId: string, orderId: string) {
    const Study = getDicomStudyModel(connection) as mongoose.Model<any>;
    return Study.findOne({ orderId, tenantId });
  }

  // --- Reports ---
  static async saveReport(connection: Connection, tenantId: string, orderId: string, data: any, userId: string) {
    const Report = getRadiologyReportModel(connection) as mongoose.Model<any>;
    const Order = getRadiologyOrderModel(connection) as mongoose.Model<any>;
    const Study = getDicomStudyModel(connection) as mongoose.Model<any>;
    
    const order = await Order.findOne({ _id: orderId, tenantId });
    if (!order) throw new AppError('Radiology order not found', 404);

    const study = await Study.findOne({ orderId, tenantId });
    
    let report = await Report.findOne({ order: orderId, tenantId });
    
    if (report) {
      // Update existing
      report.technique = data.technique || report.technique;
      report.findings = data.findings || report.findings;
      report.impression = data.impression || report.impression;
      report.recommendations = data.recommendations || report.recommendations;
      report.criticalFindings = data.criticalFindings ?? report.criticalFindings;
      report.status = data.status || report.status;
      report.reportedBy = userId;
      report.reportedAt = new Date();
    } else {
      // Create new
      report = new Report({
        ...data,
        tenantId,
        order: orderId,
        patient: order.patient,
        dicomStudyId: study?._id,
        reportedBy: userId,
        reportedAt: new Date(),
        status: data.status || 'DRAFT'
      });
    }
    
    await report.save();
    
    if (report.status === 'PENDING_VERIFICATION') {
      order.status = 'REPORTED';
      await order.save();
    } else if (report.status === 'FINAL') {
      report.verifiedBy = userId;
      report.verifiedAt = new Date();
      await report.save();
      
      order.status = 'VERIFIED';
      order.radiologist = userId;
      order.completedAt = new Date();
      await order.save();
    }
    
    return report;
  }

  static async getReportByOrderId(connection: Connection, tenantId: string, orderId: string) {
    const Report = getRadiologyReportModel(connection) as mongoose.Model<any>;
    const report = await Report.findOne({ order: orderId, tenantId })
      .populate('reportedBy', 'firstName lastName')
      .populate('verifiedBy', 'firstName lastName');
      
    if (!report) throw new AppError('Report not found for this order', 404);
    return report;
  }
}
