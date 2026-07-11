import mongoose, { Schema, Document } from "mongoose";

export interface ILearningPathDocument extends Document {
  institutionId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  coverImage: string;
  courses: mongoose.Types.ObjectId[];
  instructor: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
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
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    estimatedHours: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.LearningPath || mongoose.model<ILearningPathDocument>("LearningPath", LearningPathSchema);
