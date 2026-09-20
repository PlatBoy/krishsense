import mongoose from "mongoose";

const diseaseReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending", "reviewed", "follow_up"], default: "pending", index: true },
    input: {
      crop: { type: String, trim: true, maxlength: 120, default: "" },
      location: { type: String, trim: true, maxlength: 160, default: "" },
      symptoms: { type: String, trim: true, maxlength: 700, default: "" },
      notes: { type: String, trim: true, maxlength: 700, default: "" }
    },
    image: {
      url: { type: String, required: true },
      secureUrl: String,
      publicId: { type: String, required: true },
      originalName: String,
      mimeType: String,
      bytes: Number,
      width: Number,
      height: Number
    },
    result: {
      crop: String,
      diseaseName: { type: String, required: true },
      confidence: { type: Number, min: 0, max: 100, required: true },
      severity: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
      summary: String,
      symptoms: [String],
      treatments: [String],
      prevention: [String],
      urgentActions: [String],
      note: String,
      model: String,
      raw: mongoose.Schema.Types.Mixed
    },
    adminNote: { type: String, trim: true, default: "" },
    reviewedAt: Date
  },
  { timestamps: true }
);

diseaseReportSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export const DiseaseReport = mongoose.model("DiseaseReport", diseaseReportSchema);
