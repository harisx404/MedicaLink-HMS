import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load env
import dotenv from 'dotenv';
dotenv.config();

// Models
import { Tenant } from '../models/Tenant';
import { getUserModel } from '../models/User';
import { getPatientModel } from '../models/Patient';
import { getDoctorModel } from '../models/Doctor';
import { getAppointmentModel } from '../models/Appointment';
import Department from '../models/Department';
import Ward from '../models/Ward';
import Bed from '../models/Bed';
import { getDrugModel } from '../models/Drug';
import { getBloodUnitModel } from '../models/BloodBank';
import { getBillModel } from '../models/Bill';
import { getOperationTheaterModel } from '../models/OT';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicalink';

const CREDENTIALS_FILE = path.join(__dirname, '../../../../test_credentials.md');

async function clearDatabase() {
  console.log('🧹 Clearing database...');
  const collections = await mongoose.connection.db?.collections();
  if (!collections) return;
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

async function seed() {
  try {
    console.log('🌱 Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    
    await clearDatabase();

    // Initialize models for default connection
    const User = getUserModel(mongoose.connection);
    const Patient = getPatientModel(mongoose.connection);
    const Doctor = getDoctorModel(mongoose.connection);
    const Appointment = getAppointmentModel(mongoose.connection);
    const Drug = getDrugModel(mongoose.connection);
    const BloodUnit = getBloodUnitModel(mongoose.connection);
    const Bill = getBillModel(mongoose.connection);
    const OperationTheater = getOperationTheaterModel(mongoose.connection);

    const credentialsLog: string[] = [];
    credentialsLog.push('# MedicaLink HMS - Test Credentials');
    credentialsLog.push('Generated on: ' + new Date().toISOString() + '\n');
    credentialsLog.push('| Role | Tenant Slug | Name | Email | Password |');
    credentialsLog.push('|---|---|---|---|---|');

    // 1. Create a Tenant
    console.log('🏢 Creating Tenant...');
    const tenant = await Tenant.create({
      name: 'MedicaLink General Hospital',
      slug: 'medicalink-general',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      adminEmail: 'admin@medicalink.app',
      phone: '+1234567890',
      database: { name: 'medicalink' }
    });

    const tenantId = tenant._id;
    const tenantIdStr = tenant._id.toString();

    // Common password
    const plainPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const logCred = (role: string, name: string, email: string) => {
      credentialsLog.push(`| ${role} | \`${tenant.slug}\` | ${name} | \`${email}\` | \`${plainPassword}\` |`);
    };

    // 2. Create Users
    console.log('👥 Creating Users...');
    
    // Admin
    const admin = await User.create({
      tenantId: tenantIdStr,
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@medicalink.com',
      password: hashedPassword,
      role: 'HOSPITAL_ADMIN',
      status: 'ACTIVE'
    });
    logCred('HOSPITAL_ADMIN', 'Super Admin', admin.email);

    // Department
    console.log('🏥 Creating Department...');
    const dept = await Department.create({
      tenantId: tenantId,
      name: 'General Medicine',
      code: 'GENMED',
      isActive: true
    });

    // Doctors
    const specialties = ['Cardiology', 'Neurology', 'Orthopedics', 'General Practice', 'Pediatrics'];
    const doctors: any[] = [];
    for (let i = 0; i < 5; i++) {
      const docUser = await User.create({
        tenantId: tenantIdStr,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        role: 'DOCTOR',
        status: 'ACTIVE'
      });
      logCred('DOCTOR', `Dr. ${docUser.firstName} ${docUser.lastName}`, docUser.email);
      
      const docRecord = await Doctor.create({
        tenantId: tenantIdStr,
        userId: docUser._id,
        specialization: specialties[i],
        qualification: 'MBBS, MD',
        experience: faker.number.int({ min: 5, max: 25 }),
        registrationNumber: faker.string.alphanumeric(8).toUpperCase(),
        consultationFee: faker.number.int({ min: 100, max: 300 }),
        availability: [
          { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Friday', startTime: '09:00', endTime: '13:00' }
        ]
      });
      doctors.push(docRecord);
    }

    // Nurse
    const nurse = await User.create({
      tenantId: tenantIdStr,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: 'nurse@medicalink.com',
      password: hashedPassword,
      role: 'NURSE',
      status: 'ACTIVE'
    });
    logCred('NURSE', `${nurse.firstName} ${nurse.lastName}`, nurse.email);

    // Pharmacist
    const pharmacist = await User.create({
      tenantId: tenantIdStr,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: 'pharmacy@medicalink.com',
      password: hashedPassword,
      role: 'PHARMACIST',
      status: 'ACTIVE'
    });
    logCred('PHARMACIST', `${pharmacist.firstName} ${pharmacist.lastName}`, pharmacist.email);

    // Patients
    console.log('🤒 Creating Patients...');
    const patients: any[] = [];
    for (let i = 0; i < 10; i++) {
      const patUser = await User.create({
        tenantId: tenantIdStr,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: i === 0 ? 'patient@medicalink.com' : faker.internet.email().toLowerCase(),
        password: hashedPassword,
        role: 'PATIENT',
        status: 'ACTIVE'
      });
      
      if (i === 0) {
        logCred('PATIENT', `${patUser.firstName} ${patUser.lastName}`, patUser.email);
      }

      const patRecord = await Patient.create({
        tenantId: tenantIdStr,
        userId: patUser._id,
        firstName: patUser.firstName,
        lastName: patUser.lastName,
        mrn: 'MRN-' + faker.number.int({ min: 10000, max: 99999 }),
        createdBy: admin._id,
        registrationType: 'OPD',
        dateOfBirth: faker.date.past({ years: 60 }),
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
        phone: faker.phone.number(),
        nationality: faker.location.country(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          country: faker.location.country(),
          pincode: faker.location.zipCode()
        },
        bloodGroup: faker.helpers.arrayElement(['A+', 'B+', 'O+', 'AB+', 'O-']),
        emergencyContact: {
          name: faker.person.fullName(),
          relationship: 'Spouse',
          phone: faker.phone.number()
        }
      });
      patients.push(patRecord);
    }

    // 4. Appointments
    console.log('📅 Creating Appointments...');
    for (let i = 0; i < 20; i++) {
      const doc = faker.helpers.arrayElement(doctors);
      const pat = faker.helpers.arrayElement(patients);
      
      await Appointment.create({
        tenantId: tenantIdStr,
        patient: pat._id,
        doctor: doc.userId, // appointment wants user ref
        department: dept._id,
        appointmentDate: faker.date.recent(),
        timeSlot: { start: '10:00', end: '10:30' },
        type: 'OPD',
        status: 'SCHEDULED',
        tokenNumber: faker.number.int({ min: 1, max: 50 }),
        reasonForVisit: faker.lorem.sentence(),
        bookedBy: admin._id
      });
    }

    // 5. Drugs
    console.log('💊 Creating Drugs...');
    for (let i = 0; i < 15; i++) {
      await Drug.create({
        tenantId: tenantIdStr,
        name: faker.science.chemicalElement().name + ' ' + faker.helpers.arrayElement(['500mg', '250mg', '10mg']),
        genericName: faker.science.chemicalElement().name,
        category: 'TABLET',
        form: 'TABLET',
        strength: '500mg',
        purchaseRate: faker.number.float({ min: 5, max: 50 }),
        sellingRate: faker.number.float({ min: 60, max: 100 }),
        mrp: faker.number.float({ min: 110, max: 150 })
      });
    }

    // 6. Blood Bank
    console.log('🩸 Creating Blood Bank Inventory...');
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const rhFactors = ['POSITIVE', 'NEGATIVE'];
    for (let i=0; i<8; i++) {
      const bg = faker.helpers.arrayElement(bloodGroups);
      const rh = bg.includes('+') ? 'POSITIVE' : 'NEGATIVE';
      await BloodUnit.create({
        tenantId: tenantIdStr,
        unitNumber: faker.string.alphanumeric(10).toUpperCase(),
        bloodGroup: bg,
        rhFactor: rh,
        componentType: 'WHOLE_BLOOD',
        volume: faker.number.int({ min: 350, max: 450 }),
        collectedDate: faker.date.recent(),
        expiryDate: faker.date.future()
      });
    }

    // 7. Bills
    console.log('💵 Creating Bills...');
    for (let i = 0; i < 10; i++) {
      const pat = faker.helpers.arrayElement(patients);
      await Bill.create({
        tenantId: tenantId,
        billNumber: 'INV-' + faker.string.alphanumeric(6).toUpperCase(),
        patient: pat._id,
        billType: 'OPD',
        billDate: faker.date.recent(),
        items: [
          {
            category: 'CONSULTATION',
            description: 'Consultation Fee',
            quantity: 1,
            unitPrice: 150,
            discountPct: 0,
            taxRate: 0,
            amount: 150,
            cgstAmount: 0,
            sgstAmount: 0,
            taxAmount: 0,
            total: 150
          }
        ],
        grossAmount: 150,
        discountAmount: 0,
        taxableAmount: 150,
        cgstAmount: 0,
        sgstAmount: 0,
        taxAmount: 0,
        roundOff: 0,
        netAmount: 150,
        payments: [
          {
            mode: 'CASH',
            amount: 150,
            date: new Date()
          }
        ],
        totalPaid: 150,
        balance: 0
      });
    }

    // Write credentials
    fs.writeFileSync(CREDENTIALS_FILE, credentialsLog.join('\n'));
    console.log(`\n✅ Seeding complete! Credentials written to: ${CREDENTIALS_FILE}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
