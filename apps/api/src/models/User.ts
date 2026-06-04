import mongoose, { Schema, Document, Model, Connection } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role } from '@medicalink/shared';
import { SALT_ROUNDS, MAX_LOGIN_ATTEMPTS } from '../utils/constants';

export interface UserDocument extends Document {
  tenantId: string;
  email: string;
  password?: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  staffId?: string;
  department?: mongoose.Types.ObjectId;
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  refreshTokens: Array<{
    tokenHash: string;
    device?: string;
    ip?: string;
    createdAt: Date;
    expiresAt: Date;
  }>;
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const userSchema = new Schema<UserDocument>(
  {
    tenantId: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: Object.values(Role), required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    staffId: { type: String, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    refreshTokens: [
      {
        tokenHash: { type: String, required: true },
        device: String,
        ip: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
      },
    ],
    lastLogin: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    avatar: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, tenantId: 1 }, { unique: true });
userSchema.index({ staffId: 1 });
userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

userSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates: mongoose.UpdateQuery<UserDocument> = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // lock for 15 minutes
  }

  await this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

/**
 * Gets the User model on the specific tenant database connection.
 */
export const getUserModel = (tenantDb: Connection): Model<UserDocument> => {
  return tenantDb.model<UserDocument>('User', userSchema);
};
