import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { InsuranceApplication } from "../models/InsuranceApplication.js";
import { insuranceApplicationSchema, insuranceStatusSchema } from "../validation/schemas.js";
import { notFound } from "../utils/httpError.js";

export const insuranceRouter = Router();

function serializeInsurance(application) {
  const json = application.toJSON ? application.toJSON() : application;
  if (json.user && typeof json.user === "object") {
    json.userId = json.user.id || json.user._id?.toString();
    json.farmerName = json.user.name || "";
    json.farmName = json.user.farmName || "";
    json.farmerEmail = json.user.email || "";
  }
  return json;
}

insuranceRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user._id };
    const applications = await InsuranceApplication.find(query)
      .populate("user", "name farmName email")
      .sort({ createdAt: -1 })
      .limit(120);

    res.json({ insurance: applications.map(serializeInsurance) });
  } catch (error) {
    next(error);
  }
});

insuranceRouter.post("/", requireAuth, validateBody(insuranceApplicationSchema), async (req, res, next) => {
  try {
    const application = await InsuranceApplication.create({
      user: req.user._id,
      ...req.body
    });
    const populated = await application.populate("user", "name farmName email");
    res.status(201).json({ insurance: serializeInsurance(populated) });
  } catch (error) {
    next(error);
  }
});

insuranceRouter.patch("/:id/status", requireAuth, requireAdmin, validateBody(insuranceStatusSchema), async (req, res, next) => {
  try {
    const application = await InsuranceApplication.findById(req.params.id);
    if (!application) throw notFound("Insurance application not found");

    application.status = req.body.status;
    application.adminNote = req.body.adminNote || application.adminNote;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    const populated = await application.populate("user", "name farmName email");
    res.json({ insurance: serializeInsurance(populated) });
  } catch (error) {
    next(error);
  }
});
