import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
// Use the exact TENANT_DB_PREFIX strategy from the system
import { TENANT_DB_PREFIX } from '../utils/constants';
import { getUserModel } from '../models/User';

async function seed() {
  try {
    console.log('Connecting to MongoDB...', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Connect to the master tenant DB or the default DB depending on architecture
    // Let's connect to the default DB for the system/superadmin (or a specific DB like "medicalink_master")
    // If the system doesn't have a specific master DB, usually SUPER_ADMIN is stored in the default mongoose connection
    
    // Wait, the architecture says mongoose.connection handles global users? Let's check how Users are modeled.
    // In authService.ts: const User = getUserModel(tenantDb);
    // So users are strictly tenant-bound. How does SUPER_ADMIN login?
    // Let's use the 'master' or 'system' tenant, or just put them in the main DB connection.
    
    const defaultDb = mongoose.connection;
    const User = getUserModel(defaultDb);

    const email = 'superadmin@medicalink.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Super Admin already exists!');
      console.log(`Email: ${email}`);
      console.log(`Password: superadmin123`);
      process.exit(0);
    }

    await User.create({
      tenantId: new mongoose.Types.ObjectId().toString(), // Dummy tenant ID for system
      email,
      password: 'superadmin123',
      role: 'SUPER_ADMIN',
      firstName: 'System',
      lastName: 'Admin',
      isActive: true,
      isEmailVerified: true
    });

    console.log('Successfully created Super Admin!');
    console.log(`Email: ${email}`);
    console.log(`Password: superadmin123`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding super admin:', error);
    process.exit(1);
  }
}

seed();
