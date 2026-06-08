const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function checkLogic() {
  await mongoose.connect('mongodb+srv://muhammadharis3600_db_user:ctSmhlZbWeTa6fGe@portfolio-cluster.v8xohlb.mongodb.net/MedicaLink-HMS?appName=portfolio-cluster');
  
  // Need to use the exact User model schema since comparePassword is a method
  const userSchema = new mongoose.Schema({
    email: { type: String, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: String,
  });
  userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  };
  
  const tenantDb = mongoose.connection.useDb('medicalink_cityhospital');
  const User = tenantDb.model('User', userSchema);
  
  const email = 'admin@cityhospital.com';
  console.log('Finding:', email);
  
  const user = await User.findOne({ email }).select('+password').exec();
  if (!user) {
    console.log('User not found by mongoose!');
  } else {
    console.log('User found! Password field length:', user.password ? user.password.length : 'MISSING');
    const isValid = await user.comparePassword('Password123!');
    console.log('isValid?', isValid);
  }
  
  process.exit(0);
}

checkLogic();
