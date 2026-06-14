import mongoose, { Schema, Document } from "mongoose";

export interface IPayoutDocument extends Document {
  institutionId: mongoose.Types.ObjectId;
  periodLabel: string; // e.g. "2026-06"
  grossRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  netPayout: number;
  confirmedBookings: number;
  status: "pending" | "paid";
  paidAt: Date | null;
  note: string;
  createdAt: Date;
}

const PayoutSchema = new Schema<IPayoutDocument>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
    periodLabel:   { type: String, required: true },
    grossRevenue:  { type: Number, default: 0 },
    commissionRate:  { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
    netPayout:     { type: Number, default: 0 },
    confirmedBookings: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paidAt: { type: Date, default: null },
    note:   { type: String, default: "" },
  },
  { timestamps: true }
);

PayoutSchema.index({ institutionId: 1, periodLabel: 1 }, { unique: true });

export default mongoose.models.Payout ||
  mongoose.model<IPayoutDocument>("Payout", PayoutSchema);
