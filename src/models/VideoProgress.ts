import mongoose, { Schema, Document } from "mongoose";

export interface IVideoProgressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  section: string;
  clipIndex: number;
  watchedAt: Date;
}

const VideoProgressSchema = new Schema<IVideoProgressDocument>({
  userId:     { type: Schema.Types.ObjectId, ref: "User",   required: true },
  courseId:   { type: Schema.Types.ObjectId, ref: "Course", required: true },
  section:    { type: String, required: true },
  clipIndex:  { type: Number, required: true },
  watchedAt:  { type: Date,   default: Date.now },
});

VideoProgressSchema.index({ userId: 1, courseId: 1, section: 1, clipIndex: 1 }, { unique: true });

export default mongoose.models.VideoProgress ||
  mongoose.model<IVideoProgressDocument>("VideoProgress", VideoProgressSchema);
