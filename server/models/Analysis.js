import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["field_report", "soil_identifier"], required: true, index: true },
    status: { type: String, enum: ["pending", "reviewed", "follow_up"], default: "pending", index: true },
    input: {
      landArea: String,
      landUnit: String,
      landType: String,
      crop: String,
      location: String,
      soilColor: String,
      texture: String,
      drainage: String,
      ph: String,
      notes: String
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
      soilType: { type: String, required: true },
      confidence: { type: Number, min: 0, max: 100, required: true },
      healthScore: { type: Number, min: 0, max: 100, default: 70 },
      riskLevel: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
      soilColor: { type: String, default: "#8a5a36" },
      texture: String,
      summary: String,
      recommendations: [String],
      nutrients: [String],
      irrigation: String,
      bestCrops: [String],
      alerts: [String],
      note: String,
      model: String,
      raw: mongoose.Schema.Types.Mixed
    },
    adminNote: { type: String, trim: true, default: "" },
    reviewedAt: Date
  },
  { timestamps: true }
);

analysisSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export const Analysis = mongoose.model("Analysis", analysisSchema);
