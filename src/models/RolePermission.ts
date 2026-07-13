import mongoose, { Schema, Document } from "mongoose";

export interface IFeaturePermission {
  [key: string]: boolean | IFeaturePermission;
}

export interface IRolePermission extends Document {
  role: "super_admin" | "owner" | "admin" | "teacher" | "parent" | "student";
  permissions: IFeaturePermission;
  updatedAt: Date;
  createdAt: Date;
}

const featurePermissionSchema = new Schema({}, { strict: false });

const rolePermissionSchema = new Schema<IRolePermission>(
  {
    role: {
      type: String,
      enum: ["super_admin", "owner", "admin", "teacher", "parent", "student"],
      unique: true,
      required: true,
    },
    permissions: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.models.RolePermission ||
  mongoose.model<IRolePermission>("RolePermission", rolePermissionSchema);
