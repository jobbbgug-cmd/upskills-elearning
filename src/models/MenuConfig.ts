import mongoose, { Schema, Document } from "mongoose";

export interface IMenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: IMenuItem[];
  order: number;
  hidden?: boolean;
}

export interface IMenuConfig extends Document {
  role: "super_admin" | "owner" | "admin" | "teacher" | "parent" | "student";
  items: IMenuItem[];
  updatedAt: Date;
  createdAt: Date;
}

const menuItemSchema = new Schema({
  id: String,
  label: String,
  icon: String,
  path: String,
  order: Number,
  hidden: Boolean,
  children: [this],
}, { _id: false });

const menuConfigSchema = new Schema<IMenuConfig>(
  {
    role: {
      type: String,
      enum: ["super_admin", "owner", "admin", "teacher", "parent", "student"],
      unique: true,
      required: true,
    },
    items: [menuItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.MenuConfig ||
  mongoose.model<IMenuConfig>("MenuConfig", menuConfigSchema);
