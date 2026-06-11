import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Analysis } from "../models/Analysis.js";
import { User } from "../models/User.js";
import { statusSchema } from "../validation/schemas.js";
import { notFound } from "../utils/httpError.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/users", async (_req, res, next) => {
  try {
    const [users, counts] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      Analysis.aggregate([{ $group: { _id: "$user", count: { $sum: 1 } } }])
    ]);

    const countByUser = new Map(counts.map((item) => [item._id.toString(), item.count]));
    res.json({
      users: users.map((user) => ({
        ...user.toJSON(),
        analysisCount: countByUser.get(user._id.toString()) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/stats", async (_req, res, next) => {
  try {
    const [farmers, totalAnalyses, pending, reviewed, soilCounts] = await Promise.all([
      User.countDocuments({ role: "farmer" }),
      Analysis.countDocuments(),
      Analysis.countDocuments({ status: "pending" }),
      Analysis.countDocuments({ status: "reviewed" }),
      Analysis.aggregate([{ $group: { _id: "$result.soilType", count: { $sum: 1 } } }])
    ]);

    res.json({
      stats: {
        farmers,
        totalAnalyses,
        pending,
        reviewed,
        soilCounts: Object.fromEntries(soilCounts.map((item) => [item._id || "Unknown", item.count]))
      }
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/analyses/:id/status", validateBody(statusSchema), async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) throw notFound("Analysis not found");

    analysis.status = req.body.status;
    analysis.adminNote = req.body.adminNote || analysis.adminNote;
    analysis.reviewedAt = new Date();
    await analysis.save();

    const populated = await analysis.populate("user", "name farmName email");
    const json = populated.toJSON();
    json.farmerName = populated.user?.name || "";
    json.farmName = populated.user?.farmName || "";
    json.photoUrl = json.image?.secureUrl || json.image?.url || "";

    res.json({ analysis: json });
  } catch (error) {
    next(error);
  }
});
