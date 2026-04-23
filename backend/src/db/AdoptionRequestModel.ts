import mongoose from "mongoose";

const AdoptionRequestSchema = new mongoose.Schema({

  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child",
    required: true,
  },

  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NGO",
    required: true,
  },

  adopterType: {
    type: String,
    enum: ["Platform", "External"],
    required: true,
  },

  /* ---------- PLATFORM ADOPTER ---------- */
  adopterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Adopter",
  },

  /* ---------- EXTERNAL ADOPTER ---------- */
  externalAdopter: {
    name: String,
    contact: String,
    address: String,
  },

  proofDocuments: {
    adoptionCertificate: String,
    updatedBirthCertificate: String,
    followUpUndertaking: String,
  },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },

  adminRemarks: {
  type: String,
 },

  verifiedAt: {
  type: Date,
 },

}, { timestamps: true });

const AdoptionRequest = mongoose.model(
  "AdoptionRequest",
  AdoptionRequestSchema
);

export default AdoptionRequest;