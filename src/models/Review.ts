import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  institutionId: mongoose.Types.ObjectId;
  courseId:      mongoose.Types.ObjectId;
  studentId:     mongoose.Types.ObjectId;
  rating:        number;
  comment:       string;
  isApproved:    boolean;
  createdAt:     Date;
}

const ReviewSchema = new Schema<IReview>({
  institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
  courseId:      { type: Schema.Types.ObjectId, ref: "Course",      required: true },
  studentId:     { type: Schema.Types.ObjectId, ref: "User",        required: true },
  rating:        { type: Number, min: 1, max: 5, required: true },
  comment:       { type: String, default: "" },
  isApproved:    { type: Boolean, default: false },
}, { timestamps: true });

ReviewSchema.index({ courseId: 1, isApproved: 1 });
ReviewSchema.index({ institutionId: 1, isApproved: 1 });
ReviewSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.models.Review ?? mongoose.model<IReview>("Review", ReviewSchema);
export default Review;
