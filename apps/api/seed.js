const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';

async function seed() {
  await mongoose.connect(MONGO_URI, { dbName: 'medicalink_main' });
  console.log('Connected.');
  
  // Create schema manually since we're using raw JS
  const userSchema = new mongoose.Schema({
    tenantId: String,
    email: String,
    password: { type: String, select: false },
    role: { type: String, enum: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'STAFF', 'PATIENT'] },
    firstName: String,
    lastName: String,
    isActive: Boolean,
    isEmailVerified: Boolean,
    twoFactorEnabled: Boolean
  }, { timestamps: true });

  // Use bcrypt to hash the password
  const bcrypt = require('bcryptjs');
  userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  });

  const User = mongoose.models.User || mongoose.model('User', userSchema);
  
  const email = 'superadmin@medicalink.com';
  let user = await User.findOne({ email });
  
  if (user) {
    console.log('Super Admin exists!');
  } else {
    await User.create({
      tenantId: new mongoose.Types.ObjectId().toString(),
      email,
      password: 'superadmin123',
      role: 'SUPER_ADMIN',
      firstName: 'System',
      lastName: 'Admin',
      isActive: true,
      isEmailVerified: true,
      twoFactorEnabled: false
    });
    console.log('Super Admin created!');
  }
  
  process.exit(0);
}
seed().catch(err => { console.error(err); process.exit(1); });
