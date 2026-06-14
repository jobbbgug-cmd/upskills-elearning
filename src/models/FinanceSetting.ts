import mongoose, { Schema, Document } from "mongoose";

export interface IFinanceSetting extends Document {
  institutionId?: mongoose.Types.ObjectId;
  bankName: string;
  bankAccount: string;
  bankBrand: string;
  promptpay: string;
  qrCodeImage: string;
  updatedAt: Date;
}

const FinanceSettingSchema = new Schema<IFinanceSetting>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    bankName:    { type: String, default: "" },
    bankAccount: { type: String, default: "" },
    bankBrand:   { type: String, default: "" },
    promptpay:   { type: String, default: "" },
    qrCodeImage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.FinanceSetting ||
  mongoose.model<IFinanceSetting>("FinanceSetting", FinanceSettingSchema);
