import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadSoilPhoto } from "../middleware/upload.js";
import { Analysis } from "../models/Analysis.js";
import { analysisInputSchema, identifierInputSchema } from "../validation/schemas.js";
import { uploadImageToCloudinary } from "../services/cloudinary.js";
import { analyzeSoilPhoto } from "../services/gemini.js";
import { HttpError } from "../utils/httpError.js";

export const analysesRouter = Router();

function serializeAnalysis(analysis) {
  const json = analysis.toJSON ? analysis.toJSON() : analysis;
  if (json.user && typeof json.user === "object") {
    json.userId = json.user.id || json.user._id?.toString();
    json.farmerName = json.user.name;
    json.farmName = json.user.farmName || "";
  }
  json.photoUrl = json.image?.secureUrl || json.image?.url || "";
  return json;
}

async function createAnalysis({ req, type, input }) {
  if (!req.file) throw new HttpError(400, "A soil photo is required.");

  const [cloudinaryResult, aiResult] = await Promise.all([
    uploadImageToCloudinary(req.file, {
      userId: req.user.id,
      reportType: type,
      crop: input.crop || "",
      location: input.location || ""
    }),
    analyzeSoilPhoto({ file: req.file, input, type })
  ]);

  const analysis = await Analysis.create({
    user: req.user._id,
    type,
    input,
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

  return analysis;
}

analysesRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user._id };
    const analyses = await Analysis.find(query)
      .populate("user", "name farmName email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ analyses: analyses.map(serializeAnalysis) });
  } catch (error) {
    next(error);
  }
});

analysesRouter.post("/", requireAuth, uploadSoilPhoto.single("photo"), async (req, res, next) => {
  try {
    const parsed = analysisInputSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, "Validation failed", parsed.error.flatten());

    const analysis = await createAnalysis({
      req,
      type: "field_report",
      input: parsed.data
    });

    res.status(201).json({ analysis: serializeAnalysis(await analysis.populate("user", "name farmName email")) });
  } catch (error) {
    next(error);
  }
});

analysesRouter.post("/identify-soil", requireAuth, uploadSoilPhoto.single("photo"), async (req, res, next) => {
  try {
    const parsed = identifierInputSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, "Validation failed", parsed.error.flatten());

    const analysis = await createAnalysis({
      req,
      type: "soil_identifier",
      input: parsed.data
    });

    const populated = await analysis.populate("user", "name farmName email");
    res.status(201).json({ analysis: serializeAnalysis(populated), result: populated.result });
  } catch (error) {
    next(error);
  }
});
