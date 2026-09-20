import mongoose from "mongoose";

const insuranceApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    crop: { type: String, required: true, trim: true, maxlength: 120 },
    landArea: { type: String, trim: true, maxlength: 40, default: "" },
    landUnit: { type: String, enum: ["acre", "hectare", "bigha"], default: "acre" },
    season: { type: String, trim: true, maxlength: 80, default: "" },
    location: { type: String, trim: true, maxlength: 160, default: "" },
    coverageAmount: { type: Number, required: true, min: 1000, max: 10000000 },
    damageType: {
      type: String,
      enum: ["drought", "flood", "pest", "disease", "hail", "fire", "other"],
      default: "other"
    },
    farmerNote: { type: String, trim: true, maxlength: 900, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    adminNote: { type: String, trim: true, maxlength: 700, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date
  },
  { timestamps: true }
);

insuranceApplicationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export const InsuranceApplication = mongoose.model("InsuranceApplication", insuranceApplicationSchema);
