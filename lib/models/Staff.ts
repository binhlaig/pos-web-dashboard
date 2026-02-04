// models/Staff.ts
import mongoose, { Schema, models, model } from "mongoose";

export type StaffRole = "admin" | "manager" | "cashier" | "staff";

export interface IStaff {
  name: string;
  email?: string;
  phone?: string;

  role: StaffRole;
  isActive: boolean;

  passwordHash?: string; 
  avatarUrl?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true, index: true },

    role: {
      type: String,
      enum: ["admin", "manager", "cashier", "staff"],
      default: "staff",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },

    passwordHash: { type: String },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

// unique email (optional) — email ထည့်တဲ့အခါ unique ဖြစ်စေ
StaffSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);

export const Staff = models.Staff || model<IStaff>("Staff", StaffSchema);
