import mongoose, { Schema, Document } from "mongoose";

export interface IQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuizQuestion {
  _id: mongoose.Types.ObjectId;
  question: string;
  type: "single" | "multiple";
  options: IQuizOption[];
  points: number;
  explanation?: string;
}

export interface IQuizDocument extends Document {
  institutionId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  timeLimit: number;       // minutes, 0 = unlimited
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResultAfter: boolean;
  maxAttempts: number;     // 0 = unlimited
  isActive: boolean;
  questions: IQuizQuestion[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IQuizAttemptDocument extends Document {
  quizId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  answers: { questionId: string; selected: number[] }[];
  score: number;
  totalPoints: number;
  percentage: number;
  startedAt: Date;
  submittedAt?: Date;
  timeSpent: number; // seconds
  status: "in_progress" | "submitted";
  questionOrder: number[]; // shuffled indices
}

const OptionSchema = new Schema<IQuizOption>(
  { text: { type: String, required: true }, isCorrect: { type: Boolean, default: false } },
  { _id: false }
);

const QuestionSchema = new Schema<IQuizQuestion>({
  question:    { type: String,  required: true },
  type:        { type: String,  enum: ["single", "multiple"], default: "single" },
  options:     [OptionSchema],
  points:      { type: Number,  default: 1 },
  explanation: { type: String },
});

const QuizSchema = new Schema<IQuizDocument>(
  {
    institutionId:      { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    courseId:           { type: Schema.Types.ObjectId, ref: "Course",      default: null },
    title:              { type: String,  required: true, trim: true },
    description:        { type: String,  default: "" },
    timeLimit:          { type: Number,  default: 0 },
    randomizeQuestions: { type: Boolean, default: false },
    randomizeOptions:   { type: Boolean, default: false },
    showResultAfter:    { type: Boolean, default: true },
    maxAttempts:        { type: Number,  default: 1 },
    isActive:           { type: Boolean, default: true },
    questions:          [QuestionSchema],
    createdBy:          { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const AttemptSchema = new Schema<IQuizAttemptDocument>(
  {
    quizId:        { type: Schema.Types.ObjectId, ref: "Quiz",   required: true },
    studentId:     { type: Schema.Types.ObjectId, ref: "User",   required: true },
    courseId:      { type: Schema.Types.ObjectId, ref: "Course", default: null },
    answers:       [{ questionId: String, selected: [Number], _id: false }],
    score:         { type: Number, default: 0 },
    totalPoints:   { type: Number, default: 0 },
    percentage:    { type: Number, default: 0 },
    startedAt:     { type: Date,   default: Date.now },
    submittedAt:   { type: Date },
    timeSpent:     { type: Number, default: 0 },
    status:        { type: String, enum: ["in_progress", "submitted"], default: "in_progress" },
    questionOrder: [{ type: Number }],
  },
  { timestamps: true }
);

export const Quiz = mongoose.models.Quiz ||
  mongoose.model<IQuizDocument>("Quiz", QuizSchema);

export const QuizAttempt = mongoose.models.QuizAttempt ||
  mongoose.model<IQuizAttemptDocument>("QuizAttempt", AttemptSchema);
