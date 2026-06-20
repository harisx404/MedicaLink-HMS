import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getTenantDb } from '../config/db';
import { getPrescriptionModel, PrescriptionDocument } from '../models/Prescription';
import { getConsultationModel } from '../models/Consultation';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { getCounterModel } from '../models/Counter';
import { sendSuccess } from '../utils/apiResponse';
import PDFDocument from 'pdfkit';

export const createPrescription: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { tenantId, userId: doctorId } = req.user;
  const { consultationId, patientId, medications, generalInstructions, followUpDate, digitalSignature } = req.body;

  const tenantDb = await getTenantDb(tenantId);
  const Prescription = getPrescriptionModel(tenantDb);
  const Consultation = getConsultationModel(tenantDb);
  const Counter = getCounterModel(tenantDb);

  // Verify consultation belongs to this tenant
  const consultation = await (Consultation as any).findOne({ _id: consultationId, tenantId }).lean().exec();
  if (!consultation) throw new AppError('Consultation not found', 404);

  // Generate auto-incremented Prescription Number
  const counter = await Counter.findOneAndUpdate(
    { _id: 'prescription_number', tenantId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = counter!.seq.toString().padStart(6, '0');
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
    qrCode: `medicalink://rx/${prescriptionNumber}`,
  });

  await prescription.save();

  // Attach prescription reference to the consultation plan
  if (!consultation.plan) consultation.plan = {};
  if (!consultation.plan.prescriptions) consultation.plan.prescriptions = [];
  consultation.plan.prescriptions.push(prescription.id as string);
  await consultation.save();

  return sendSuccess(res, 'Prescription created', prescription, 201);
});

export const getPrescription: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { tenantId } = req.user;

  const tenantDb = await getTenantDb(tenantId);
  const Prescription = getPrescriptionModel(tenantDb);

  const prescription = await Prescription.findOne({ _id: req.params.id, tenantId })
    .populate('patient')
    .populate({ path: 'doctor', populate: { path: 'userId' } })
    .populate('consultation')
    .exec();

  if (!prescription) throw new AppError('Prescription not found', 404);

  return sendSuccess(res, 'Prescription retrieved', prescription);
});

export const generatePrescriptionPdf: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { tenantId } = req.user;

  const tenantDb = await getTenantDb(tenantId);
  const Prescription = getPrescriptionModel(tenantDb);

  const prescription = await Prescription.findOne({ _id: req.params.id, tenantId })
    .populate('patient')
    .populate({ path: 'doctor', populate: { path: 'userId' } })
    .exec();

  if (!prescription) throw new AppError('Prescription not found', 404);

  // Use typed populated fields from PrescriptionDocument
  const doctorPopulated = prescription.doctor as unknown as {
    user?: { firstName?: string; lastName?: string };
  };
  const patientPopulated = prescription.patient as unknown as {
    firstName?: string;
    lastName?: string;
    age?: number;
    gender?: string;
  };

  const docName = `Dr. ${doctorPopulated.user?.firstName ?? 'Unknown'} ${doctorPopulated.user?.lastName ?? ''}`.trim();
  const patientName = `${patientPopulated.firstName ?? ''} ${patientPopulated.lastName ?? ''}`.trim();

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=RX-${prescription.prescriptionNumber}.pdf`);
  doc.pipe(res);

  // Hospital Letterhead
  doc.fontSize(20).text('MedicaLink Hospital Network', { align: 'center' });
  doc.fontSize(10).text('123 Health Avenue, Medical District, NY', { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, 90).lineTo(550, 90).stroke();
  doc.moveDown();

  // RX Meta
  doc.fontSize(12).font('Helvetica-Bold').text(`RX No: ${prescription.prescriptionNumber}`, 50, 110);
  doc.text(`Date: ${new Date(prescription.createdAt ?? Date.now()).toLocaleDateString()}`, 400, 110);
  doc.moveDown();
  doc.font('Helvetica-Bold').text('Doctor: ', 50, 140).font('Helvetica').text(docName, 100, 140);
  doc.font('Helvetica-Bold').text('Patient: ', 50, 160).font('Helvetica').text(patientName, 100, 160);
  doc
    .font('Helvetica-Bold').text('Age/Sex: ', 400, 160)
    .font('Helvetica')
    .text(`${patientPopulated.age ?? 'N/A'} / ${patientPopulated.gender ?? 'N/A'}`, 460, 160);

  doc.moveDown(2);
  doc.fontSize(18).font('Helvetica-Bold').text('Rx', 50, doc.y);
  doc.moveDown();

  // Medications list — each medication is typed from PrescriptionDocument
  prescription.medications.forEach((med: PrescriptionDocument['medications'][number], index: number) => {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`${index + 1}. ${med.drugName} ${med.strength ?? ''} ${med.form ?? ''}`);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        `    Take ${med.dose} ${med.doseUnit ?? ''} via ${med.route ?? 'Oral'}, ` +
        `${med.frequency?.times ?? ''} times a ${med.frequency?.period ?? ''} for ${med.duration}`
      );
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
    doc
      .font('Helvetica-Bold')
      .text('Follow-up Date: ')
      .font('Helvetica')
      .text(new Date(prescription.followUpDate).toLocaleDateString());
  }

  // Signature block
  doc.moveDown(4);
  doc.font('Helvetica-Bold').text('Doctor Signature:', 400, doc.y);
  if (prescription.digitalSignature) {
    doc.font('Helvetica').text('Digitally Signed', 400, doc.y + 20);
  } else {
    doc.moveTo(400, doc.y + 30).lineTo(550, doc.y + 30).stroke();
  }

  // Footer
  doc.fillColor('gray').fontSize(8).text('Powered by MedicaLink HMS', 50, 750, { align: 'center' });

  doc.end();
});
