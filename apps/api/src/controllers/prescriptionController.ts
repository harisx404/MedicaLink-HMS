import { Request, Response } from 'express';
import { getTenantDb } from '../config/db';
import { getPrescriptionModel } from '../models/Prescription';
import { getConsultationModel } from '../models/Consultation';
import { AppError } from '../middlewares/errorHandler';
import { getCounterModel } from '../models/Counter';
import PDFDocument from 'pdfkit';

export const createPrescription = async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const doctorId = req.user!.userId || (req.user as any).id;
  const { consultationId, patientId, medications, generalInstructions, followUpDate, digitalSignature } = req.body;

  const tenantDb = await getTenantDb(tenantId);
  const Prescription = getPrescriptionModel(tenantDb) as any;
  const Consultation = getConsultationModel(tenantDb) as any;
  const Counter = getCounterModel(tenantDb) as any;

  // Verify Consultation
  const consultation = await Consultation.findOne({ _id: consultationId, tenantId });
  if (!consultation) throw new AppError('Consultation not found', 404);

  // Generate Prescription Number
  const counter = await Counter.findOneAndUpdate(
    { _id: 'prescription_number', tenantId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  const seq = counter.seq.toString().padStart(6, '0');
  const prescriptionNumber = `RX-${new Date().getFullYear()}-${seq}`;

  const prescription = new Prescription({
    tenantId,
    prescriptionNumber,
    consultation: consultationId,
    patient: patientId,
    doctor: doctorId,
    medications,
    generalInstructions,
    followUpDate,
    digitalSignature,
    qrCode: `medicalink://rx/${prescriptionNumber}`
  });

  await prescription.save();

  // Attach to consultation
  if (!consultation.plan) consultation.plan = {};
  if (!consultation.plan.prescriptions) consultation.plan.prescriptions = [];
  consultation.plan.prescriptions.push(prescription.id);
  await consultation.save();

  res.status(201).json({
    success: true,
    message: 'Prescription created',
    data: prescription
  });
};

export const getPrescription = async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const tenantDb = await getTenantDb(tenantId);
  const Prescription = getPrescriptionModel(tenantDb) as any;

  const prescription = await Prescription.findOne({ _id: req.params.id, tenantId })
    .populate('patient')
    .populate({ path: 'doctor', populate: { path: 'userId' } })
    .populate('consultation');

  if (!prescription) throw new AppError('Prescription not found', 404);

  res.status(200).json({
    success: true,
    message: 'Prescription retrieved',
    data: prescription
  });
};

export const generatePrescriptionPdf = async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const tenantDb = await getTenantDb(tenantId);
  const Prescription = getPrescriptionModel(tenantDb) as any;

  const prescription = await Prescription.findOne({ _id: req.params.id, tenantId })
    .populate('patient')
    .populate({ path: 'doctor', populate: { path: 'userId' } });

  if (!prescription) throw new AppError('Prescription not found', 404);

  const p = prescription as any;
  const docName = `Dr. ${p.doctor?.user?.firstName || 'Unknown'} ${p.doctor?.user?.lastName || ''}`;
  const patientName = `${p.patient?.firstName || ''} ${p.patient?.lastName || ''}`;

  // PDF Generation logic
  const doc = new PDFDocument({ margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=RX-${prescription.prescriptionNumber}.pdf`);
  
  doc.pipe(res);

  // Hospital Letterhead Mockup
  doc.fontSize(20).text('MedicaLink Hospital Network', { align: 'center' });
  doc.fontSize(10).text('123 Health Avenue, Medical District, NY', { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, 90).lineTo(550, 90).stroke();
  doc.moveDown();

  // Rx Meta
  doc.fontSize(12).font('Helvetica-Bold').text(`RX No: ${prescription.prescriptionNumber}`, 50, 110);
  doc.text(`Date: ${new Date(prescription.createdAt || Date.now()).toLocaleDateString()}`, 400, 110);
  
  doc.moveDown();
  doc.font('Helvetica-Bold').text('Doctor: ', 50, 140).font('Helvetica').text(docName, 100, 140);
  doc.font('Helvetica-Bold').text('Patient: ', 50, 160).font('Helvetica').text(patientName, 100, 160);
  doc.font('Helvetica-Bold').text('Age/Sex: ', 400, 160).font('Helvetica').text(`${p.patient?.age || 'N/A'} / ${p.patient?.gender || 'N/A'}`, 460, 160);

  doc.moveDown(2);
  doc.fontSize(18).font('Helvetica-Bold').text('Rx', 50, doc.y);
  doc.moveDown();

  // Medications
  p.medications.forEach((med: any, index: number) => {
    doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${med.drugName} ${med.strength || ''} ${med.form || ''}`);
    doc.fontSize(10).font('Helvetica').text(`    Take ${med.dose} ${med.doseUnit || ''} via ${med.route || 'Oral'}, ${med.frequency?.times} times a ${med.frequency?.period} for ${med.duration}`);
    if (med.instructions) doc.text(`    Instructions: ${med.instructions}`);
    doc.moveDown();
  });

  if (prescription.generalInstructions) {
    doc.moveDown();
    doc.font('Helvetica-Bold').text('General Instructions:');
    doc.font('Helvetica').text(prescription.generalInstructions);
  }

  if (prescription.followUpDate) {
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Follow-up Date: ').font('Helvetica').text(new Date(prescription.followUpDate).toLocaleDateString());
  }

  // Signatures
  doc.moveDown(4);
  doc.font('Helvetica-Bold').text('Doctor Signature:', 400, doc.y);
  if (prescription.digitalSignature) {
    doc.font('Helvetica').text('Digitally Signed', 400, doc.y + 20);
  } else {
    doc.moveTo(400, doc.y + 30).lineTo(550, doc.y + 30).stroke();
  }

  // Footer
  // Changed { color: 'gray' } because it is not a valid TextOptions property for pdfkit. We should use doc.fillColor instead.
  doc.fillColor('gray').fontSize(8).text('Powered by MedicaLink HMS', 50, 750, { align: 'center' });

  doc.end();
};
