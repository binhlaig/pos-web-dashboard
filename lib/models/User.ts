import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "CASHIER" | "ADMIN";

export interface IUser {
  username: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true, lowercase: true, index: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["CASHIER", "ADMIN"], default: "CASHIER" },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
