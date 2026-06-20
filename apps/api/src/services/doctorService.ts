import { Connection } from 'mongoose';
import { AppError } from '../middlewares/errorHandler';
import { getDoctorModel } from '../models/Doctor';
import { getUserModel } from '../models/User';
import { SharedDoctor, Role } from '@medicalink/shared';

export const doctorService = {
  /**
   * List doctors with filtering
   */
  async listDoctors(tenantDb: Connection, query: Record<string, string | undefined>) {
    const Doctor = getDoctorModel(tenantDb);
    
    const filter: Record<string, unknown> = {};
    
    if (query.specialty) {
      filter['specializations.specialty'] = new RegExp(query.specialty, 'i');
    }
    
    if (query.status) {
      filter.currentStatus = query.status;
    }
    
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const doctors = await Doctor.find(filter)
      .populate('userId', 'firstName lastName email phone profileImage')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Doctor.countDocuments(filter);

    return {
      doctors: doctors.map(doc => mapDoctorToShared(doc)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get single doctor profile
   */
  async getDoctorById(id: string, tenantDb: Connection) {
    const Doctor = getDoctorModel(tenantDb);
    
    const doctor = await Doctor.findById(id)
      .populate('userId', 'firstName lastName email phone profileImage')
      .lean();
      
    if (!doctor) throw new AppError('Doctor not found', 404);
    
    return mapDoctorToShared(doctor);
  },

  /**
   * Create a new doctor profile attached to an existing user
   */
  async createDoctor(data: Partial<SharedDoctor>, tenantDb: Connection) {
    const Doctor = getDoctorModel(tenantDb);
    const User = getUserModel(tenantDb);
    
    // Validate User
    const user = await User.findById(data.userId);
    if (!user) throw new AppError('Associated user not found', 404);
    if (user.role !== Role.DOCTOR && user.role !== Role.SENIOR_DOCTOR) {
      throw new AppError('User role must be DOCTOR or SENIOR_DOCTOR', 400);
    }
    
    // Check if profile exists
    const existing = await Doctor.findOne({ userId: data.userId });
    if (existing) throw new AppError('Doctor profile already exists for this user', 400);

    const doctor = await Doctor.create({
      ...data,
      tenantId: user.tenantId
    });

    const populated = await Doctor.findById(doctor._id)
      .populate('userId', 'firstName lastName email phone profileImage')
      .lean();
      
    return mapDoctorToShared(populated!);
  },

  /**
   * Update doctor profile
   */
  async updateDoctor(id: string, data: Partial<SharedDoctor>, tenantDb: Connection) {
    const Doctor = getDoctorModel(tenantDb);
    
    const doctor = await Doctor.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .populate('userId', 'firstName lastName email phone profileImage')
      .lean();
      
    if (!doctor) throw new AppError('Doctor not found', 404);
    
    return mapDoctorToShared(doctor);
  },

  /**
   * Update weekly schedule
   */
  async updateSchedule(id: string, weeklySchedule: Record<string, unknown>[], tenantDb: Connection) {
    const Doctor = getDoctorModel(tenantDb);
    
    const doctor = await Doctor.findByIdAndUpdate(
      id, 
      { $set: { weeklySchedule } }, 
      { new: true, runValidators: true }
    ).lean();
      
    if (!doctor) throw new AppError('Doctor not found', 404);
    
    return mapDoctorToShared(doctor);
  },

  /**
   * Update availability status
   */
  async updateStatus(id: string, status: string, tenantDb: Connection) {
    const Doctor = getDoctorModel(tenantDb);
    
    const doctor = await Doctor.findByIdAndUpdate(
      id, 
      { $set: { currentStatus: status } }, 
      { new: true }
    ).lean();
      
    if (!doctor) throw new AppError('Doctor not found', 404);
    
    // Socket.io broadcast DOCTOR_STATUS_UPDATE is handled in Phase 18
    
    return mapDoctorToShared(doctor);
  }
};

// Helper to map Mongoose doc to Shared interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDoctorToShared(doc: any): SharedDoctor {
  return {
    id: doc._id.toString(),
    userId: doc.userId._id ? doc.userId._id.toString() : doc.userId.toString(),
    user: doc.userId._id ? {
      id: doc.userId._id.toString(),
      firstName: doc.userId.firstName,
      lastName: doc.userId.lastName,
      email: doc.userId.email,
      profileImage: doc.userId.profileImage,
      role: Role.DOCTOR,
      isActive: true,
      createdAt: ''
    } : undefined,
    tenantId: doc.tenantId,
    registrationNumber: doc.registrationNumber,
    specializations: doc.specializations || [],
    qualifications: doc.qualifications || [],
    experience: doc.experience,
    weeklySchedule: doc.weeklySchedule || [],
    consultationFee: doc.consultationFee,
    biography: doc.biography,
    languages: doc.languages || [],
    awards: doc.awards || [],
    publications: doc.publications || [],
    photo: doc.photo,
    avgRating: doc.avgRating,
    totalRatings: doc.totalRatings,
    totalConsultations: doc.totalConsultations,
    isAvailableToday: doc.isAvailableToday,
    currentStatus: doc.currentStatus,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
  };
}
