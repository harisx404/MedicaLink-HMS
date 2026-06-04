import { Tenant } from '../models/Tenant';
import { AuditLog } from '../models/AuditLog';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';
import mongoose from 'mongoose';
import { getUserModel } from '../models/User';
import { TENANT_DB_PREFIX } from '../utils/constants';

export const superAdminService = {
  getDashboardStats: async () => {
    const totalTenants = await Tenant.countDocuments();
    const activeTenants = await Tenant.countDocuments({ status: 'ACTIVE' });
    const totalUsers = activeTenants * 15 + Math.floor(Math.random() * 50); // Mocked users
    const activeUsersToday = Math.floor(totalUsers * 0.4); // Mock active users for now
    
    // Mock MRR logic based on tenants and plans
    const mrr = activeTenants * 299; // Mocking average $299/mo per tenant
    
    // Mock 12-month revenue chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueChart = months.map(month => ({
      name: month,
      revenue: Math.floor(Math.random() * 50000) + 10000
    }));

    const newSignups = await Tenant.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) } // From start of month
    });

    return {
      totalTenants,
      activeTenants,
      totalUsers,
      activeUsersToday,
      mrr,
      newSignups,
      supportTicketsPending: Math.floor(Math.random() * 15), // Mock
      revenueChart
    };
  },

  getAnalytics: async () => {
    // Generate mock analytics data for Recharts
    const mrrData = Array.from({ length: 30 }).map((_, i) => ({
      date: `Day ${i + 1}`,
      mrr: 10000 + (i * 200) + Math.floor(Math.random() * 500)
    }));

    const dauData = Array.from({ length: 30 }).map((_, i) => ({
      date: `Day ${i + 1}`,
      activeUsers: 500 + (i * 10) + Math.floor(Math.random() * 50)
    }));

    const geographicDistribution = [
      { country: 'United States', count: 45 },
      { country: 'United Kingdom', count: 12 },
      { country: 'Canada', count: 8 },
      { country: 'Australia', count: 5 },
      { country: 'Others', count: 15 }
    ];

    return {
      mrrData,
      dauData,
      geographicDistribution,
      metrics: {
        churnRate: '2.4%',
        ltv: '$8,500',
        arpu: '$350',
        arr: '$124,500'
      }
    };
  },

  getSystemHealth: async () => {
    // Return mock system health metrics
    return {
      apiStatus: 'Operational',
      uptime: process.uptime(), // Real uptime
      cpuUsage: Math.floor(Math.random() * 40) + 10, // Mock 10-50%
      memoryUsage: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024), // Real heap in MB
      dbLatency: Math.floor(Math.random() * 20) + 5, // Mock 5-25ms
      redisLatency: Math.floor(Math.random() * 5) + 1, // Mock 1-6ms
      redisStatus: 'Operational',
      mongoDbStatus: 'Operational',
      activeConnections: Math.floor(Math.random() * 500) + 100,
      recentErrors: Math.floor(Math.random() * 5),
      lastDeployment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      version: 'v1.4.2',
      queueDepths: {
        emails: Math.floor(Math.random() * 100),
        reports: Math.floor(Math.random() * 20),
        webhooks: Math.floor(Math.random() * 50)
      }
    };
  },

  getAuditLogs: async (limit: number = 50, skip: number = 0) => {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actor', 'firstName lastName email')
      .populate('tenantId', 'name');
      
    const total = await AuditLog.countDocuments();
    
    return {
      logs,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  },

  impersonateTenant: async (tenantId: string) => {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new AppError('Tenant not found', 404);

    const dbName = `${TENANT_DB_PREFIX}${tenant.slug}`;
    const tenantDb = mongoose.connection.useDb(dbName, { useCache: true });
    const User = getUserModel(tenantDb);

    // Find the primary admin for this tenant (could be first user with HOSPITAL_ADMIN role)
    const adminUser = await User.findOne({ role: 'HOSPITAL_ADMIN', isActive: true });
    if (!adminUser) throw new AppError('No active admin found for this hospital', 404);

    const payload = {
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
      tenantId: tenant._id.toString()
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
      algorithm: 'HS256',
    });

    const user = {
      id: adminUser._id.toString(),
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      email: adminUser.email,
      role: adminUser.role,
      tenantId: adminUser.tenantId,
      isActive: adminUser.isActive,
      createdAt: adminUser.createdAt.toISOString(),
    };

    return { user, accessToken, tenantSlug: tenant.slug };
  }
};
