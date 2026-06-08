const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testPassword() {
  await mongoose.connect('mongodb+srv://muhammadharis3600_db_user:ctSmhlZbWeTa6fGe@portfolio-cluster.v8xohlb.mongodb.net/MedicaLink-HMS?appName=portfolio-cluster');
  
  const tenantDb = mongoose.connection.useDb('medicalink_cityhospital');
  const user = await tenantDb.collection('users').findOne({ email: 'admin@cityhospital.com' });
  
  if (!user) {
    console.log('User not found!');
  } else {
    console.log('Found user, password hash:', user.password);
    const isMatch = await bcrypt.compare('Password123!', user.password);
    console.log('Password123! match?', isMatch);
    console.log('loginAttempts:', user.loginAttempts, 'lockUntil:', user.lockUntil);
  }
  
  process.exit(0);
}

testPassword();
