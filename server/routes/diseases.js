import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadSoilPhoto } from "../middleware/upload.js";
import { DiseaseReport } from "../models/DiseaseReport.js";
import { uploadImageToCloudinary } from "../services/cloudinary.js";
import { analyzeCropDiseasePhoto } from "../services/gemini.js";
import { diseaseInputSchema } from "../validation/schemas.js";
import { HttpError } from "../utils/httpError.js";

export const diseasesRouter = Router();

function serializeDisease(report) {
  const json = report.toJSON ? report.toJSON() : report;
  if (json.user && typeof json.user === "object") {
    json.userId = json.user.id || json.user._id?.toString();
    json.farmerName = json.user.name || "";
    json.farmName = json.user.farmName || "";
    json.farmerEmail = json.user.email || "";
  }
  json.photoUrl = json.image?.secureUrl || json.image?.url || "";
  return json;
}

diseasesRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user._id };
    const reports = await DiseaseReport.find(query)
      .populate("user", "name farmName email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ diseases: reports.map(serializeDisease) });
  } catch (error) {
    next(error);
  }
});

diseasesRouter.post("/", requireAuth, uploadSoilPhoto.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, "A crop photo is required.");
    const parsed = diseaseInputSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, "Validation failed", parsed.error.flatten());

    const [cloudinaryResult, aiResult] = await Promise.all([
      uploadImageToCloudinary(req.file, {
        userId: req.user.id,
        reportType: "disease_detection",
        crop: parsed.data.crop,
        location: parsed.data.location
      }),
      analyzeCropDiseasePhoto({ file: req.file, input: parsed.data })
    ]);

    const report = await DiseaseReport.create({
      user: req.user._id,
      input: parsed.data,
      image: {
        url: cloudinaryResult.url,
        secureUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        bytes: req.file.size,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height
      },
      result: aiResult
    });

    const populated = await report.populate("user", "name farmName email");
    res.status(201).json({ disease: serializeDisease(populated), result: populated.result });
  } catch (error) {
    next(error);
  }
});
