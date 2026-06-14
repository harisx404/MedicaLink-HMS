import mongoose from 'mongoose';
import { getBillModel } from '../models/Bill';
import { getPatientModel } from '../models/Patient';
import { getAppointmentModel } from '../models/Appointment';
import Bed from '../models/Bed';
import { getConsultationModel } from '../models/Consultation';

export const getExecutiveDashboardMetrics = async (tenantDb: mongoose.Connection) => {
  const Bill = getBillModel(tenantDb);
  const Patient = getPatientModel(tenantDb);
  const Appointment = getAppointmentModel(tenantDb);
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Revenue MTD
  const revenueMtdResult = await Bill.aggregate([
    { $match: { billDate: { $gte: startOfMonth }, status: { $ne: 'VOID' } } },
    { $group: { _id: null, total: { $sum: '$netAmount' } } }
  ]);
  const revenueMtd = revenueMtdResult[0]?.total || 0;

  // Last Month Revenue
  const revenueLastMonthResult = await Bill.aggregate([
    { $match: { billDate: { $gte: startOfLastMonth, $lt: startOfMonth }, status: { $ne: 'VOID' } } },
    { $group: { _id: null, total: { $sum: '$netAmount' } } }
  ]);
  const revenueLastMonth = revenueLastMonthResult[0]?.total || 0;

  // Bed Occupancy
  const totalBeds = await Bed.countDocuments({ tenantId: tenantDb.name });
  const occupiedBeds = await Bed.countDocuments({ tenantId: tenantDb.name, status: 'OCCUPIED' });
  const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

  // OPD Patients MTD
  const opdPatientsMtd = await Appointment.countDocuments({
    date: { $gte: startOfMonth },
    type: 'IN_PERSON',
    status: 'COMPLETED'
  });

  // Trend logic
  const revenueGrowth = revenueLastMonth > 0 ? ((revenueMtd - revenueLastMonth) / revenueLastMonth) * 100 : 0;

  // Monthly Revenue Trend (Last 6 Months)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const revenueTrend = await Bill.aggregate([
    { $match: { billDate: { $gte: sixMonthsAgo }, status: { $ne: 'VOID' } } },
    { 
      $group: { 
        _id: { month: { $month: '$billDate' }, year: { $year: '$billDate' } }, 
        revenue: { $sum: '$netAmount' } 
      } 
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const formattedRevenueTrend = revenueTrend.map(t => ({
    name: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
    revenue: t.revenue,
    target: Math.round(t.revenue * 1.1) // dummy target
  }));

  // Department Split
  const departmentSplit = await Bill.aggregate([
    { $match: { billDate: { $gte: startOfMonth }, status: { $ne: 'VOID' } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.category', value: { $sum: '$items.total' } } }
  ]);

  const formattedDepartmentSplit = departmentSplit.map(d => ({
    name: d._id,
    value: d.value
  }));

  return {
    kpis: {
      totalRevenue: revenueMtd,
      revenueGrowth: Number(revenueGrowth.toFixed(1)),
      bedOccupancy: Number(occupancyRate.toFixed(1)),
      opdPatients: opdPatientsMtd,
      alos: 3.5, // Avg Length of Stay (mocked for now)
      patientSatisfaction: 94.2 // Mocked
    },
    charts: {
      revenueTrend: formattedRevenueTrend,
      departmentSplit: formattedDepartmentSplit
    },
    insights: [
      { type: 'positive', text: `Revenue is ${revenueGrowth >= 0 ? 'up' : 'down'} ${Math.abs(revenueGrowth).toFixed(1)}% vs last month.` },
      { type: 'neutral', text: `Bed occupancy is currently at ${occupancyRate.toFixed(1)}%.` }
    ]
  };
};

export const getClinicalMetrics = async (tenantDb: mongoose.Connection) => {
  const Consultation = getConsultationModel(tenantDb);
  // Aggregate common diagnoses
  const startOfMonth = new Date(new Date().setDate(1));
  const diagnosesAgg = await Consultation.aggregate([
    { $match: { tenantId: tenantDb.name, createdAt: { $gte: startOfMonth } } },
    { $unwind: '$assessment.diagnoses' },
    { $group: { _id: '$assessment.diagnoses.icdCode', count: { $sum: 1 }, name: { $first: '$assessment.diagnoses.description' } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  return {
    topDiagnoses: diagnosesAgg.map((d: any) => ({ name: d.name || d._id, value: d.count })),
    readmissionRate: 4.2,
    mortalityRate: 1.1
  };
};

export const getOperationalMetrics = async (tenantDb: mongoose.Connection) => {
  const Appointment = getAppointmentModel(tenantDb);
  const startOfMonth = new Date(new Date().setDate(1));
  
  const docsProductivity = await Appointment.aggregate([
    { $match: { date: { $gte: startOfMonth }, status: 'COMPLETED' } },
    { $group: { _id: '$doctor', consultations: { $sum: 1 } } },
    { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'docInfo' } },
    { $unwind: '$docInfo' },
    { $project: { name: { $concat: ['$docInfo.firstName', ' ', '$docInfo.lastName'] }, consultations: 1 } },
    { $sort: { consultations: -1 } },
    { $limit: 5 }
  ]);

  return {
    doctorProductivity: docsProductivity,
    otUtilization: 76,
    avgWaitTime: 18 // minutes
  };
};

export const getFinancialMetrics = async (tenantDb: mongoose.Connection) => {
  const Bill = getBillModel(tenantDb);
  const startOfMonth = new Date(new Date().setDate(1));
  
  const payerSplit = await Bill.aggregate([
    { $match: { billDate: { $gte: startOfMonth }, status: { $ne: 'VOID' } } },
    { $group: { 
      _id: { $cond: [{ $ifNull: ['$insuranceClaim', false] }, 'Insurance', 'Cash'] },
      total: { $sum: '$netAmount' } 
    } }
  ]);

  const collectionAgg = await Bill.aggregate([
    { $match: { billDate: { $gte: startOfMonth }, status: { $ne: 'VOID' } } },
    { $group: { _id: null, billed: { $sum: '$netAmount' }, collected: { $sum: '$totalPaid' } } }
  ]);

  return {
    payerSplit: payerSplit.map(p => ({ name: p._id, value: p.total })),
    collectionEfficiency: collectionAgg[0] ? (collectionAgg[0].collected / collectionAgg[0].billed) * 100 : 0
  };
};
