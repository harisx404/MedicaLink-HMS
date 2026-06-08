import { Request, Response, RequestHandler } from 'express';
import { Types } from 'mongoose';
import { asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import Bed from '../models/Bed';
import Ward from '../models/Ward';
import Department from '../models/Department';
import { getUserModel } from '../models/User';

/**
 * @desc    Get dashboard metrics for hospital admin
 * @route   GET /api/v1/admin/dashboard/stats
 * @access  Private (Admin/SuperAdmin)
 */
export const getDashboardStats: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const db = req.tenantDb;

  if (!tenantId || !db) return sendError(res, 'Tenant context missing', 400);

  const BedModel = db.model('Bed', Bed.schema);
  const WardModel = db.model('Ward', Ward.schema);
  const DepartmentModel = db.model('Department', Department.schema);
  const User = getUserModel(db);

  // Fetch counts in parallel
  const [
    totalDepartments,
    totalWards,
    totalBeds,
    occupiedBeds,
    totalStaff
  ] = await Promise.all([
    DepartmentModel.countDocuments({ tenantId }),
    WardModel.countDocuments({ tenantId }),
    BedModel.countDocuments({ tenantId }),
    BedModel.countDocuments({ tenantId, status: 'OCCUPIED' }),
    User.countDocuments({ tenantId, isActive: true })
  ]);

  const bedOccupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

  // Aggregate wards to get occupancy per ward
  const wardsOccupancy = await BedModel.aggregate([
    { $match: { tenantId: new Types.ObjectId(tenantId) } },
    {
      $group: {
        _id: '$wardId',
        totalBeds: { $sum: 1 },
        occupiedBeds: {
          $sum: { $cond: [{ $eq: ['$status', 'OCCUPIED'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'wards',
        localField: '_id',
        foreignField: '_id',
        as: 'wardInfo'
      }
    },
    { $unwind: '$wardInfo' },
    {
      $project: {
        wardName: '$wardInfo.name',
        wardCode: '$wardInfo.code',
        totalBeds: 1,
        occupiedBeds: 1,
        occupancyRate: {
          $multiply: [{ $divide: ['$occupiedBeds', '$totalBeds'] }, 100]
        }
      }
    }
  ]);

  sendSuccess(res, 'Dashboard stats retrieved', {
    overview: {
      totalDepartments,
      totalWards,
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      bedOccupancyRate: Math.round(bedOccupancyRate * 10) / 10,
      totalStaff
    },
    wardsOccupancy
  });
});
