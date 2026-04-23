import mongoose, { Document, Types } from "mongoose";

/* ---------- INTERFACE ---------- */

export interface IChild extends Document {
  ngoId: Types.ObjectId;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  dateOfBirth?: Date;
  healthStatus?: string;
  educationLevel?: string;
  gallery: string[];

  adoptionStatus: "Available" | "Adoption Requested" | "Adopted";
  adopterId: Types.ObjectId | null;
  externalAdopterName?: string | null;

  canEdit: boolean;
  blockReason?: string;
  blockedAt?: Date;

  hasEditRequest: boolean;
  editRequestedAt?: Date | null;
}

/* ---------- SCHEMA ---------- */

const childSchema = new mongoose.Schema<IChild>(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
    },

    name: { type: String, required: true },
    age: { type: Number, required: true },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    dateOfBirth: { type: Date },
    healthStatus: { type: String },
    educationLevel: { type: String },

    gallery: {
      type: [String],
      default: [],
    },

    adoptionStatus: {
      type: String,
      enum: ["Available", "Adoption Requested", "Adopted"],
      default: "Available",
    },

    adopterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Adopter",
      default: null,
    },

    externalAdopterName: {
      type: String,
      default: null,
    },

    canEdit: {
      type: Boolean,
      default: true,
    },

    blockReason: { type: String },
    blockedAt: { type: Date },

    hasEditRequest: {
      type: Boolean,
      default: false,
    },

    editRequestedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* ---------- MODEL ---------- */

const Child = mongoose.model<IChild>("Child", childSchema);

export default Child;