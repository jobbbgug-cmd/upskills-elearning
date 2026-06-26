import mongoose, { Schema, Document, Model } from "mongoose";

export interface IForumPost extends Document {
  institutionId: mongoose.Types.ObjectId;
  courseId:      mongoose.Types.ObjectId;
  authorId:      mongoose.Types.ObjectId;
  title:         string;
  body:          string;
  isPinned:      boolean;
  isResolved:    boolean;
  upvotes:       mongoose.Types.ObjectId[];
  createdAt:     Date;
}

export interface IForumReply extends Document {
  institutionId: mongoose.Types.ObjectId;
  postId:        mongoose.Types.ObjectId;
  authorId:      mongoose.Types.ObjectId;
  body:          string;
  upvotes:       mongoose.Types.ObjectId[];
  createdAt:     Date;
}

const ForumPostSchema = new Schema<IForumPost>({
  institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
  courseId:      { type: Schema.Types.ObjectId, ref: "Course",      required: true },
  authorId:      { type: Schema.Types.ObjectId, ref: "User",        required: true },
  title:         { type: String, required: true, trim: true },
  body:          { type: String, required: true },
  isPinned:      { type: Boolean, default: false },
  isResolved:    { type: Boolean, default: false },
  upvotes:       [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const ForumReplySchema = new Schema<IForumReply>({
  institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
  postId:        { type: Schema.Types.ObjectId, ref: "ForumPost",   required: true },
  authorId:      { type: Schema.Types.ObjectId, ref: "User",        required: true },
  body:          { type: String, required: true },
  upvotes:       [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

ForumPostSchema.index({ institutionId: 1, courseId: 1, isPinned: -1, createdAt: -1 });
ForumReplySchema.index({ postId: 1, createdAt: 1 });

export const ForumPost:  Model<IForumPost>  = mongoose.models.ForumPost  ?? mongoose.model<IForumPost>("ForumPost",   ForumPostSchema);
export const ForumReply: Model<IForumReply> = mongoose.models.ForumReply ?? mongoose.model<IForumReply>("ForumReply", ForumReplySchema);
