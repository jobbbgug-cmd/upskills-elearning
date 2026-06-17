import mongoose, { Schema } from "mongoose";

interface ISystemSetting {
  key: string;
  value: string;
}

const SystemSettingSchema = new Schema<ISystemSetting>({
  key:   { type: String, required: true, unique: true },
  value: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.SystemSetting ??
  mongoose.model<ISystemSetting>("SystemSetting", SystemSettingSchema);
