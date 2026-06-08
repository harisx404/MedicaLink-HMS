import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRole extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isCustom: boolean;
  permissions: {
    // Dashboard
    viewDashboard: boolean;
    
    // Departments
    viewDepartments: boolean;
    manageDepartments: boolean;
    
    // Wards & Beds
    viewWards: boolean;
    manageWards: boolean;
    manageBeds: boolean;
    
    // Staff & Users
    viewStaff: boolean;
    manageStaff: boolean;
    
    // Roles
    viewRoles: boolean;
    manageRoles: boolean;
    
    // Settings
    viewSettings: boolean;
    manageSettings: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
    permissions: {
      viewDashboard: { type: Boolean, default: false },
      
      viewDepartments: { type: Boolean, default: false },
      manageDepartments: { type: Boolean, default: false },
      
      viewWards: { type: Boolean, default: false },
      manageWards: { type: Boolean, default: false },
      manageBeds: { type: Boolean, default: false },
      
      viewStaff: { type: Boolean, default: false },
      manageStaff: { type: Boolean, default: false },
      
      viewRoles: { type: Boolean, default: false },
      manageRoles: { type: Boolean, default: false },
      
      viewSettings: { type: Boolean, default: false },
      manageSettings: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure uniqueness of role name per tenant
roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

// We need a helper to get the tenant-specific model
export const getRoleModel = (connection: mongoose.Connection): Model<IRole> => {
  return connection.models.Role || connection.model<IRole>('Role', roleSchema);
};

export default getRoleModel;
