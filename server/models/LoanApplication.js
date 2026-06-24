import mongoose from "mongoose";

const loanApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 1000, max: 10000000 },
    purpose: { type: String, required: true, trim: true, maxlength: 200 },
    crop: { type: String, trim: true, maxlength: 120, default: "" },
    landArea: { type: String, trim: true, maxlength: 40, default: "" },
    landUnit: { type: String, enum: ["acre", "hectare", "bigha"], default: "acre" },
    tenureMonths: { type: Number, required: true, min: 1, max: 120 },
    farmerNote: { type: String, trim: true, maxlength: 700, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    adminNote: { type: String, trim: true, maxlength: 700, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date
  },
  { timestamps: true }
);

loanApplicationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export const LoanApplication = mongoose.model("LoanApplication", loanApplicationSchema);
