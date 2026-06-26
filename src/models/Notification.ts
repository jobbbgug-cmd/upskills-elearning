import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId:     mongoose.Types.ObjectId;
  type:       "homework_graded" | "quiz_available" | "homework_due" | "certificate" | "announcement" | "general";
  title:      string;
  body:       string;
  link?:      string;
  isRead:     boolean;
  createdAt:  Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:     { type: String, enum: ["homework_graded", "quiz_available", "homework_due", "certificate", "announcement", "general"], default: "general" },
    title:    { type: String, required: true },
    body:     { type: String, default: "" },
    link:     { type: String },
    isRead:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
