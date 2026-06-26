import mongoose, { Schema, Document } from "mongoose";

export interface ILiveSession extends Document {
  institutionId?: mongoose.Types.ObjectId;
  courseId?:      mongoose.Types.ObjectId;
  title:          string;
  description:    string;
  meetLink:       string;
  scheduledAt:    Date;
  duration:       number; // minutes
  status:         "upcoming" | "live" | "ended";
  replayLink:     string;
  createdBy:      mongoose.Types.ObjectId;
  notified:       boolean;
}

const LiveSessionSchema = new Schema<ILiveSession>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    courseId:      { type: Schema.Types.ObjectId, ref: "Course",      default: null },
    title:         { type: String, required: true, trim: true },
    description:   { type: String, default: "" },
    meetLink:      { type: String, default: "" },
    scheduledAt:   { type: Date,   required: true },
    duration:      { type: Number, default: 60 },
    status:        { type: String, enum: ["upcoming", "live", "ended"], default: "upcoming" },
    replayLink:    { type: String, default: "" },
    createdBy:     { type: Schema.Types.ObjectId, ref: "User", required: true },
    notified:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

LiveSessionSchema.index({ institutionId: 1, scheduledAt: -1 });

export default mongoose.models.LiveSession ||
  mongoose.model<ILiveSession>("LiveSession", LiveSessionSchema);
