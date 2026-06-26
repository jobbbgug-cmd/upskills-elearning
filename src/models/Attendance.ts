import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceDocument extends Document {
  institutionId?: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  sessionId: string;
  studentId: mongoose.Types.ObjectId;
  method: "qr" | "manual" | "online";
  checkedInAt: Date;
  note?: string;
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    courseId:      { type: Schema.Types.ObjectId, ref: "Course",      required: true },
    sessionId:     { type: String,  required: true },
    studentId:     { type: Schema.Types.ObjectId, ref: "User", required: true },
    method:        { type: String,  enum: ["qr", "manual", "online"], default: "manual" },
    checkedInAt:   { type: Date,    default: Date.now },
    note:          { type: String },
  },
  { timestamps: true }
);

AttendanceSchema.index({ courseId: 1, sessionId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.Attendance ||
  mongoose.model<IAttendanceDocument>("Attendance", AttendanceSchema);
