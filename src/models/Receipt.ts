import mongoose, { Schema, Document } from "mongoose";

export interface IReceipt extends Document {
  institutionId?:  mongoose.Types.ObjectId;
  bookingId:       mongoose.Types.ObjectId;
  studentId:       mongoose.Types.ObjectId;
  courseId:        mongoose.Types.ObjectId;
  receiptNumber:   string;
  amount:          number;
  issuedAt:        Date;
  issuedBy:        mongoose.Types.ObjectId;
  note:            string;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    bookingId:     { type: Schema.Types.ObjectId, ref: "Booking",     required: true, unique: true },
    studentId:     { type: Schema.Types.ObjectId, ref: "User",        required: true },
    courseId:      { type: Schema.Types.ObjectId, ref: "Course",      required: true },
    receiptNumber: { type: String, unique: true },
    amount:        { type: Number, default: 0 },
    issuedAt:      { type: Date, default: Date.now },
    issuedBy:      { type: Schema.Types.ObjectId, ref: "User", required: true },
    note:          { type: String, default: "" },
  },
  { timestamps: true }
);

ReceiptSchema.pre("save", async function (next) {
  if (!this.receiptNumber) {
    const count = await (this.constructor as typeof mongoose.Model).countDocuments({ institutionId: this.institutionId });
    const year  = new Date().getFullYear() + 543;
    this.receiptNumber = `REC-${year}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

export default mongoose.models.Receipt ||
  mongoose.model<IReceipt>("Receipt", ReceiptSchema);
