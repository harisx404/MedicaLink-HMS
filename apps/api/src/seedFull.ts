// @ts-nocheck
/* eslint-disable */
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { getUserModel } from './models/User';
import { Tenant } from './models/Tenant';
import { getPatientModel } from './models/Patient';
import Department from './models/Department';
import Ward from './models/Ward';
import Bed from './models/Bed';
import { getAppointmentModel } from './models/Appointment';
import { getDrugModel } from './models/Drug';
import { getDrugBatchModel } from './models/DrugBatch';
import { getBillModel } from './models/Bill';
import { getServiceChargeModel } from './models/ServiceCharge';
import { getConsultationModel } from './models/Consultation';
import { getPrescriptionModel } from './models/Prescription';
import { getLabOrderModel } from './models/LabOrder';
import { getTestCatalogModel } from './models/TestCatalog';
import { getEmergencyPatientModel } from './models/Emergency';
import { getICUPatientModel } from './models/ICUPatient';
import { getOTCaseModel } from './models/OT';
import { getBloodUnitModel } from './models/BloodBank';

async function seedFull() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/medicalink';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    
    // Connect to Main DB
    await mongoose.connect(mongoUri, {
      dbName: process.env.MAIN_DB_NAME || 'medicalink_main'
    });
    console.log(`MongoDB connected to: ${process.env.MAIN_DB_NAME || 'medicalink_main'}`);

    console.log('⚠️ DROPPING MAIN DATABASE...');
    await mongoose.connection.db.dropDatabase();
    
    // Create Super Admin in Main DB
    const User = getUserModel(mongoose.connection);
    await User.create({
      tenantId: '000000000000000000000000',
      email: 'superadmin@medicalink.com',
      password: 'Password123!',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true
    });
    console.log('✅ Super Admin created.');

    // Create City Hospital Tenant
    const tenant = await Tenant.create({
      name: 'City Hospital',
      slug: 'cityhospital',
      adminEmail: 'admin@cityhospital.com',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      database: { name: 'medicalink_cityhospital' },
      features: {
        pharmacy: true, lab: true, radiology: true, telemedicine: true, bloodBank: true, ai: true
      }
    });
    console.log('✅ Tenant City Hospital created.');

    // Connect to Tenant DB
    const tenantDbName = `medicalink_${tenant.slug}`;
    const tenantDb = mongoose.connection.useDb(tenantDbName, { useCache: true });
    
    console.log(`⚠️ DROPPING TENANT DATABASE: ${tenantDbName}...`);
    await tenantDb.dropDatabase();

    const TenantUser = getUserModel(tenantDb);
    const PatientModel = getPatientModel(tenantDb);
    const AppointmentModel = getAppointmentModel(tenantDb);
    const DrugModel = getDrugModel(tenantDb);
    const DrugBatchModel = getDrugBatchModel(tenantDb);
    const BillModel = getBillModel(tenantDb);
    const ServiceChargeModel = getServiceChargeModel(tenantDb);
    const ConsultationModel = getConsultationModel(tenantDb);
    const PrescriptionModel = getPrescriptionModel(tenantDb);
    const TestCatalogModel = getTestCatalogModel(tenantDb);
    const LabOrderModel = getLabOrderModel(tenantDb);
    const EmergencyPatientModel = getEmergencyPatientModel(tenantDb);
    const ICUPatientModel = getICUPatientModel(tenantDb);
    const OTCaseModel = getOTCaseModel(tenantDb);
    const BloodUnitModel = getBloodUnitModel(tenantDb);

    // Default tenant ID for models that are not dynamically generated
    Department.schema.path('tenantId', { type: mongoose.Schema.Types.ObjectId, default: tenant._id });
    Ward.schema.path('tenantId', { type: mongoose.Schema.Types.ObjectId, default: tenant._id });
    Bed.schema.path('tenantId', { type: mongoose.Schema.Types.ObjectId, default: tenant._id });

    // --- SEED DEPARTMENTS ---
    // Mongoose Models which are singleton we just pass tenantId
    const depts = await Department.insertMany([
      { name: 'Cardiology', code: 'CARD', type: 'CLINICAL', tenantId: tenant._id, isActive: true },
      { name: 'Intensive Care Unit', code: 'ICU', type: 'CLINICAL', tenantId: tenant._id, isActive: true },
      { name: 'Emergency', code: 'ER', type: 'CLINICAL', tenantId: tenant._id, isActive: true },
      { name: 'Surgery', code: 'SURG', type: 'CLINICAL', tenantId: tenant._id, isActive: true },
      { name: 'Laboratory', code: 'LAB', type: 'DIAGNOSTIC', tenantId: tenant._id, isActive: true },
      { name: 'Pharmacy', code: 'PHARM', type: 'SUPPORT', tenantId: tenant._id, isActive: true },
      { name: 'Billing', code: 'FIN', type: 'SUPPORT', tenantId: tenant._id, isActive: true },
    ]);
    console.log('✅ Departments seeded.');

    // --- SEED USERS ---
    const usersToCreate = [
      { email: 'admin@cityhospital.com', first: 'Hospital', last: 'Admin', role: 'HOSPITAL_ADMIN', dept: null },
      { email: 'doctor.smith@cityhospital.com', first: 'John', last: 'Smith', role: 'DOCTOR', dept: depts[0]._id },
      { email: 'nurse.joy@cityhospital.com', first: 'Joy', last: 'Williams', role: 'NURSE', dept: depts[1]._id },
      { email: 'reception.front@cityhospital.com', first: 'Front', last: 'Desk', role: 'RECEPTIONIST', dept: null },
      { email: 'pharmacy.head@cityhospital.com', first: 'Pill', last: 'Counter', role: 'PHARMACIST', dept: depts[5]._id },
      { email: 'lab.tech@cityhospital.com', first: 'Test', last: 'Tubes', role: 'LAB_TECHNICIAN', dept: depts[4]._id },
      { email: 'finance.manager@cityhospital.com', first: 'Cash', last: 'Flow', role: 'BILLING_STAFF', dept: depts[6]._id },
      { email: 'icu.doctor@cityhospital.com', first: 'Critical', last: 'Care', role: 'SENIOR_DOCTOR', dept: depts[1]._id }
    ];

    const users = [];
    for (const u of usersToCreate) {
      const createdUser = await TenantUser.create({
        email: u.email,
        password: 'Password123!',
        firstName: u.first,
        lastName: u.last,
        role: u.role,
        departmentId: u.dept,
        tenantId: tenant._id.toString(),
        isActive: true,
        specialization: u.role === 'DOCTOR' ? 'Cardiologist' : undefined
      });
      users.push(createdUser);
    }
    const doctorId = users.find(u => u.role === 'DOCTOR')!._id;
    const adminId = users.find(u => u.role === 'HOSPITAL_ADMIN')!._id;
    console.log('✅ Users seeded.');

    // --- SEED WARDS & BEDS ---
    const icuWard = await Ward.create({
      tenantId: tenant._id, name: 'ICU Alpha', type: 'ICU', capacity: 5, currentOccupancy: 2, isActive: true,
      floor: '1st Floor', code: 'ICU-A', departmentId: depts[1]._id
    });
    
    for (let i = 1; i <= 5; i++) {
      await Bed.create({
        tenantId: tenant._id, wardId: icuWard._id, bedNumber: `ICU-${i}`,
        type: 'ICU', status: i <= 2 ? 'OCCUPIED' : 'AVAILABLE'
      });
    }
    console.log('✅ Wards & Beds seeded.');

    // --- SEED PATIENTS ---
    const dummyPatients = Array.from({ length: 15 }).map((_, i) => ({
      uhid: `HMS-2026-${(i+1).toString().padStart(6, '0')}`,
      tenantId: tenant._id,
      firstName: `Patient${i+1}`,
      lastName: `Test`,
      dateOfBirth: new Date(1980 + (i % 30), (i % 12), (i % 28) + 1),
      gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
      bloodGroup: ['A+', 'O+', 'B+', 'AB+', 'O-'][i % 5],
      phone: `+1555000${(i+1).toString().padStart(3, '0')}`,
      email: `patient${i+1}@test.com`,
      address: { street: 'Main St', city: 'City', state: 'State', country: 'Country', pincode: '12345' },
      emergencyContact: { name: 'Emergency Contact', relationship: 'Friend', phone: '+15550009999' },
      nationality: 'American',
      registrationType: i % 3 === 0 ? 'IPD' : 'OPD',
      createdBy: adminId,
      registrationDate: new Date(),
      isActive: true
    }));
    
    const patients = await PatientModel.insertMany(dummyPatients);
    console.log('✅ Patients seeded.');

    // --- SEED DRUGS ---
    const drugs = await DrugModel.insertMany([
      { tenantId: tenant._id, code: 'DRG-001', name: 'Paracetamol', genericName: 'Acetaminophen', category: 'TABLET', form: 'Tablet', strength: '500mg', unit: 'Tablet', currentStock: 500, minimumStock: 100, maximumStock: 1000, reorderLevel: 200, isFormulary: true, purchaseRate: 0.10, sellingRate: 0.50, mrp: 0.50, isActive: true },
      { tenantId: tenant._id, code: 'DRG-002', name: 'Amoxicillin', genericName: 'Amoxicillin', category: 'CAPSULE', form: 'Capsule', strength: '250mg', unit: 'Capsule', currentStock: 500, minimumStock: 50, maximumStock: 1000, reorderLevel: 100, isFormulary: true, purchaseRate: 0.20, sellingRate: 1.00, mrp: 1.00, isActive: true },
      { tenantId: tenant._id, code: 'DRG-003', name: 'Lisinopril', genericName: 'Lisinopril', category: 'TABLET', form: 'Tablet', strength: '10mg', unit: 'Tablet', currentStock: 500, minimumStock: 30, maximumStock: 1000, reorderLevel: 50, isFormulary: true, purchaseRate: 0.15, sellingRate: 0.75, mrp: 0.75, isActive: true }
    ]);
    
    for (const d of drugs) {
      await DrugBatchModel.create({
        tenantId: tenant._id, drug: d._id, batchNumber: `BTH-${d.code}-1`,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // +1 year
        quantity: 500, remainingQuantity: 500, purchaseRate: 0.10, mrp: 0.50
      });
    }
    console.log('✅ Drugs and Batches seeded.');

    // --- SEED LAB TEST CATALOG ---
    const labCatalog = await TestCatalogModel.insertMany([
      { tenantId: tenant._id, code: 'CBC', name: 'Complete Blood Count', category: 'HEMATOLOGY', sampleType: 'BLOOD', price: 50, turnaroundTime: 120, isActive: true, parameters: [{ name: 'Hemoglobin', unit: 'g/dL', referenceRanges: [{ minValue: 13.0, maxValue: 17.0 }], dataType: 'NUMERIC' }] },
      { tenantId: tenant._id, code: 'LIPID', name: 'Lipid Profile', category: 'BIOCHEMISTRY', sampleType: 'BLOOD', price: 100, turnaroundTime: 240, isActive: true, parameters: [{ name: 'Total Cholesterol', unit: 'mg/dL', referenceRanges: [{ maxValue: 200 }], dataType: 'NUMERIC' }] }
    ]);
    console.log('✅ Test Catalog seeded.');

    // --- SEED SERVICE CHARGES ---
    const serviceCharges = await ServiceChargeModel.insertMany([
      { tenantId: tenant._id, code: 'SC-001', name: 'General Consultation', department: depts[0]._id, category: 'CONSULTATION', price: 150, taxRate: 0, isActive: true },
      { tenantId: tenant._id, code: 'SC-002', name: 'ICU Room Rent', department: depts[1]._id, category: 'ROOM', price: 500, taxRate: 0, isActive: true }
    ]);
    console.log('✅ Service Charges seeded.');

    // --- SEED APPOINTMENTS & CONSULTATIONS ---
    for (let i = 0; i < 5; i++) {
      const apt = await AppointmentModel.create({
        tenantId: tenant._id,
        appointmentNumber: `APT-2026-000${i+1}`,
        patient: patients[i]._id,
        doctor: doctorId,
        department: depts[0]._id,
        appointmentDate: new Date().toISOString(),
        timeSlot: { start: '10:00', end: '10:30' },
        type: 'OPD',
        status: i < 3 ? 'COMPLETED' : 'SCHEDULED',
        visitType: 'NEW',
        paymentStatus: 'PAID',
        bookedBy: adminId,
        reasonForVisit: 'General Checkup',
        tokenNumber: i + 1,
        priority: 'NORMAL'
      });

      if (i < 3) {
        // Create Consultation
        const firstBed = await Bed.findOne({ wardId: icuWard._id });
        const icuPatient = await ICUPatientModel.create({
          tenantId: tenant._id, patient: patients[5]._id, status: 'STABLE',
          admittedAt: new Date(), primaryDoctor: doctorId, condition: 'Stable',
          admissionDiagnosis: 'Post-op Monitoring', admittedBy: doctorId, bed: firstBed._id, ward: icuWard._id
        });
        const cons = await ConsultationModel.create({
          tenantId: tenant._id, patient: patients[i]._id, doctor: doctorId, appointment: apt._id,
          visitDate: new Date().toISOString(), status: 'COMPLETED', consultationNumber: `CON-00${i+1}`,
          visitType: 'OPD',
          subjective: { symptoms: [{symptom: 'Chest pain', duration: '2 days', severity: 'Mild', notes: ''}] },
          objective: { vitals: { bp: { systolic: 120, diastolic: 80 }, pulse: 75, temperature: 98.6 } },
          assessment: { diagnoses: [{ icdCode: 'I20.9', description: 'Non-cardiac chest pain', type: 'PRIMARY', severity: 'MILD', status: 'PROVISIONAL' }] },
          plan: { instructions: 'Rest for 2 days.' }
        });

        // Create Prescription
        await PrescriptionModel.create({
          tenantId: tenant._id, consultation: cons._id, patient: patients[i]._id, doctor: doctorId,
          prescriptionNumber: `PRX-00${i+1}`,
          date: new Date(), pharmacyStatus: 'PENDING',
          medications: [{ drugId: drugs[0]._id, drugName: 'Paracetamol', dose: '500mg', frequency: { times: 3, period: 'DAY' }, duration: '3 days', quantity: 9, isSubstitutable: true }]
        });

        // Create Bill
        await BillModel.create({
          tenantId: tenant._id, patient: patients[i]._id, billType: 'OPD', status: 'PAID',
          billNumber: `INV-2026-000${i+1}`,
          items: [
            { category: 'CONSULTATION', description: 'Consultation', quantity: 1, unitPrice: 150, amount: 150, total: 150 }
          ],
          grossAmount: 150, netAmount: 150, totalPaid: 150, billDate: new Date(), generatedBy: adminId
        });
      }
    }
    console.log('✅ Appointments, Consultations, and Bills seeded.');

    // --- SEED EMERGENCY & ICU ---
    await EmergencyPatientModel.create({
      tenantId: tenant._id, patient: patients[4]._id, 
      disposition: 'ADMITTED', dispositionTime: new Date(), dispositionDoctor: doctorId,
      arrivalMode: 'AMBULANCE', chiefComplaint: 'Severe Chest Pain', triageColor: 'RED', triageLevel: 'RESUSCITATION'
    });

    const icuPatient = await ICUPatientModel.create({
      tenantId: tenant._id, patient: patients[6]._id, status: 'STABLE',
      admittedAt: new Date(), primaryDoctor: doctorId, condition: 'Stable',
      admissionDiagnosis: 'Post-op Monitoring', admittedBy: doctorId, bed: (await Bed.findOne({ bedNumber: 'ICU-1' }))!._id, ward: icuWard._id
    });
    console.log('✅ Emergency & ICU seeded.');

    // --- SEED BLOOD BANK ---
    await BloodUnitModel.insertMany([
      { tenantId: tenant._id, unitNumber: 'BLD-001', bloodGroup: 'O+', rhFactor: 'POSITIVE', componentType: 'WHOLE_BLOOD', volume: 450, collectedDate: new Date(), expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), status: 'AVAILABLE' },
      { tenantId: tenant._id, unitNumber: 'BLD-002', bloodGroup: 'A+', rhFactor: 'POSITIVE', componentType: 'PACKED_RBC', volume: 300, collectedDate: new Date(), expiryDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), status: 'AVAILABLE' }
    ]);
    console.log('✅ Blood Bank seeded.');

    console.log('\n=======================================');
    console.log('🎉 ALL PHASES FULLY SEEDED SUCCESSFULLY!');
    console.log('=======================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  }
}

seedFull();
