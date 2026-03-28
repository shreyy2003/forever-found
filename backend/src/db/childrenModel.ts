import mongoose from "mongoose";

const childSchema = new mongoose.Schema({
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "NGO", required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  dateOfBirth: { type: Date },
  healthStatus: { type: String },
  educationLevel: { type: String },
  gallery: {type: [String],default: []},
  adoptionStatus: {type: String,enum: ["Available", "Adopted"],default: "Available"},
  adopterId: { type: mongoose.Schema.Types.ObjectId, ref: "Adopter", default: null },
  canEdit: {
      type: Boolean,
      default: true,
    },
    blockReason: {
      type: String,
    },
    blockedAt: {
      type: Date,
    },
    hasEditRequest: {
      type: Boolean,
      default: false,
    },

    editRequestedAt: {
      type: Date,
      default: null,
    },
},{ timestamps: true }
);

const Child = mongoose.model("Child", childSchema);
export default Child;