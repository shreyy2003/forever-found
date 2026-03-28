import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    yearOfEstablishment: Number,
    website: String,

    contact: { type: String, required: true },
    alternateContact: { type: String, default: null },

    contactPersonName: { type: String, default: null },
    contactPersonDesignation: { type: String, default: null },

    email: { type: String, required: true, unique: true },
    registrationNumber: {type: String,required: true,unique: true,trim: true},
    caraRegistrationNumber: {type: String,unique: true,required: true, trim: true},

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    about: String,
    numberOfChildren: { type: Number, default: 0 },
    logo: { type: String, default: ""},

    testimonials: [
      {
        name: String,
        role: String,
        feedback: String,
      },
    ],
    gallery: [
      {
        type: {
          type: String,
          enum: ["registration", "cara", "gallery"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    socialId: String,
    password: { type: String, required: true, minlength: 8 },
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Optional admin control (not approval-related)
    canEdit: { type: Boolean, default: true },
    blockReason: { type: String, default: null },
    blockedAt: { type: Date, default: null },

    // --- Email verification ---
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
      required: false,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
      required: false,
    },

    // --- Phone verification ---
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneOTP: {
      type: String,
      default: null,
    },
    phoneOTPExpires: {
      type: Date,
      default: null,
    },

    //Edit Request Control
    hasEditRequest: {
      type: Boolean,
      default: false,
    },

    editRequestedAt: {
      type: Date,
      default: null,
    },

    // --- Session tokens ---
    sessions: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        userAgent: { type: String },
        ipAddress: { type: String },
      },
    ],

  },
  { timestamps: true }
);

const NGO = mongoose.model("NGO", ngoSchema);
export default NGO;
