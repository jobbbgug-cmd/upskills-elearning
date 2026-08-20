import mongoose, { Schema, Document } from "mongoose";

export interface ILearningPathDocument extends Document {
  institutionId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  coverImage: string;
  courses: mongoose.Types.ObjectId[];
  instructor: string;
  createdBy?: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedHours: number;
  price: number;
  discount: number;
  discountType: "percentage" | "fixed";
  whoIsItSuitableFor?: string;
  whatYouWillLearn?: string;
  isActive: boolean;
  createdAt: Date;
}

const LearningPathSchema = new Schema<ILearningPathDocument>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    coverImage: { type: String, default: "" },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    instructor: { type: String, required: true },
    createdBy: { type: String, default: null },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    estimatedHours: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    whoIsItSuitableFor: { type: String, default: "" },
    whatYouWillLearn: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.LearningPath || mongoose.model<ILearningPathDocument>("LearningPath", LearningPathSchema);
