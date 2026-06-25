import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLogDocument extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  institutionId?: string;
  institutionName?: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLogDocument>(
  {
    userId:          { type: String, required: true },
    userName:        { type: String, required: true },
    userEmail:       { type: String, required: true },
    userRole:        { type: String, required: true },
    institutionId:   { type: String, default: null },
    institutionName: { type: String, default: null },
    action:          { type: String, required: true },
    description:     { type: String, required: true },
    metadata:        { type: Schema.Types.Mixed, default: null },
    ipAddress:       { type: String, default: null },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ userRole: 1, createdAt: -1 });

export default mongoose.models.ActivityLog ??
  mongoose.model<IActivityLogDocument>("ActivityLog", ActivityLogSchema);
