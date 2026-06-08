import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { getUserModel } from './models/User';
import { Tenant } from './models/Tenant';
import { getPatientModel } from './models/Patient';

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/medicalink';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      dbName: process.env.MAIN_DB_NAME || 'medicalink_main'
    });
    console.log(`MongoDB connected to: ${process.env.MAIN_DB_NAME || 'medicalink_main'}`);

    // Create super admin in main DB
    const User = getUserModel(mongoose.connection);
    
    const superAdminEmail = 'superadmin@medicalink.com';
    const password = 'SuperAdmin123!';
    
    let user = await User.findOne({ email: superAdminEmail });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      user = await User.create({
        tenantId: '000000000000000000000000',
        email: superAdminEmail,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isActive: true
      });
      console.log('Super Admin created successfully!');
    } else {
      console.log('Super Admin already exists.');
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(password, salt);
      await User.updateOne({ _id: user._id }, { $set: { password: newHash } });
      console.log('Super Admin password reset successfully.');
    }

    // Create a demo tenant
    let tenant = await Tenant.findOne({ slug: 'cityhospital' });
    if (!tenant) {
      tenant = await Tenant.create({
        name: 'City Hospital',
        slug: 'cityhospital',
        adminEmail: 'admin@cityhospital.com',
        status: 'ACTIVE',
        plan: 'ENTERPRISE',
        database: { name: 'medicalink_cityhospital' },
        features: {
          pharmacy: true,
          lab: true,
          radiology: true,
          telemedicine: true,
          bloodBank: true,
          ai: true
        }
      });
      console.log('City Hospital tenant created successfully!');
    }

    // Create City Hospital Admin in Tenant DB
    const tenantDbName = `medicalink_${tenant.slug}`;
    const tenantDb = mongoose.connection.useDb(tenantDbName, { useCache: true });
    const TenantUser = getUserModel(tenantDb);

    const admin = await TenantUser.findOne({ email: 'admin@cityhospital.com' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt); // Password123!
      
      await TenantUser.create({
        email: 'admin@cityhospital.com',
        password: hashedPassword,
        firstName: 'Hospital',
        lastName: 'Admin',
        role: 'HOSPITAL_ADMIN',
        tenantId: tenant._id.toString(),
        isActive: true
      });
      console.log('City Hospital Admin created successfully!');
    } else {
      console.log('City Hospital Admin already exists.');
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash('Password123!', salt);
      await TenantUser.updateOne({ _id: admin._id }, { $set: { password: newHash } });
      console.log('City Hospital Admin password reset to Password123!');
    }
    // Add 3 dummy patients
    const PatientModel = getPatientModel(tenantDb);
    const count = await PatientModel.countDocuments();
    
    if (count === 0) {
      const dummyPatients = [
        {
          uhid: 'HMS-2026-000001',
          tenantId: tenant._id.toString(),
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1980-05-15'),
          gender: 'MALE',
          bloodGroup: 'O+',
          maritalStatus: 'MARRIED',
          nationality: 'American',
          phone: '+15551234567',
          email: 'john.doe@example.com',
          address: { street: '123 Main St', city: 'New York', state: 'NY', country: 'USA', pincode: '10001' },
          emergencyContact: { name: 'Jane Doe', relationship: 'Wife', phone: '+15559876543' },
          allergies: [{ allergen: 'Penicillin', type: 'DRUG', severity: 'SEVERE', reaction: 'Hives', addedBy: admin!._id }],
          currentMedications: [{ drug: 'Lisinopril', dose: '10mg', frequency: 'Once daily', prescribedBy: admin!._id }],
          registrationType: 'OPD',
          createdBy: admin!._id,
          registrationDate: new Date('2026-06-01'),
          isActive: true
        },
        {
          uhid: 'HMS-2026-000002',
          tenantId: tenant._id.toString(),
          firstName: 'Sarah',
          lastName: 'Smith',
          dateOfBirth: new Date('1992-11-20'),
          gender: 'FEMALE',
          bloodGroup: 'A-',
          maritalStatus: 'SINGLE',
          nationality: 'Canadian',
          phone: '+15552345678',
          email: 'sarah.s@example.com',
          address: { street: '456 Oak Ave', city: 'Toronto', state: 'ON', country: 'Canada', pincode: 'M5V 2N1' },
          emergencyContact: { name: 'Robert Smith', relationship: 'Father', phone: '+15558765432' },
          allergies: [],
          currentMedications: [],
          registrationType: 'IPD',
          createdBy: admin!._id,
          registrationDate: new Date('2026-06-05'),
          isActive: true
        },
        {
          uhid: 'HMS-2026-000003',
          tenantId: tenant._id.toString(),
          firstName: 'Baby',
          lastName: 'Williams',
          dateOfBirth: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days old
          gender: 'MALE',
          bloodGroup: 'B+',
          maritalStatus: 'SINGLE',
          nationality: 'American',
          phone: '+15553456789',
          email: 'williams.family@example.com',
          address: { street: '789 Pine Ln', city: 'Chicago', state: 'IL', country: 'USA', pincode: '60601' },
          emergencyContact: { name: 'Mary Williams', relationship: 'Mother', phone: '+15557654321' },
          allergies: [],
          currentMedications: [],
          registrationType: 'OPD',
          createdBy: admin!._id,
          registrationDate: new Date('2026-06-06'),
          isActive: true
        }
      ];

      await PatientModel.insertMany(dummyPatients);
      console.log('Seeded 3 dummy patients.');
    } else {
      console.log('Patients already seeded.');
    }
    await mongoose.disconnect();
    console.log('Database seeded and disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
