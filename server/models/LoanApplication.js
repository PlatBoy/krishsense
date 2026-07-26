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
    reviewedAt: Date,
    creditedAt: Date,
    repaidAmount: { type: Number, min: 0, default: 0 },
    repaymentStatus: { type: String, enum: ["not_started", "partial", "paid"], default: "not_started", index: true },
    repayments: [
      {
        amount: { type: Number, required: true, min: 1 },
        bankName: { type: String, trim: true, maxlength: 120, default: "" },
        accountName: { type: String, trim: true, maxlength: 120, default: "" },
        accountLast4: { type: String, trim: true, maxlength: 4, default: "" },
        ifsc: { type: String, trim: true, maxlength: 20, default: "" },
        paidAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

loanApplicationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
    ret.remainingAmount = Math.max(0, Number(ret.amount || 0) - Number(ret.repaidAmount || 0));
    return ret;
  }
});

export const LoanApplication = mongoose.model("LoanApplication", loanApplicationSchema);
