import bcrypt from "bcryptjs";
import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Analysis } from "../models/Analysis.js";
import { LoanApplication } from "../models/LoanApplication.js";
import { User } from "../models/User.js";
import { adminPasswordResetSchema, loanStatusSchema, statusSchema, userStatusSchema } from "../validation/schemas.js";
import { HttpError, notFound } from "../utils/httpError.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

function ensureFarmer(user) {
  if (!user) throw notFound("Farmer not found");
  if (user.role !== "farmer") throw new HttpError(400, "Only farmer accounts can be managed here");
}

function serializeLoan(loan) {
  const json = loan.toJSON ? loan.toJSON() : loan;
  if (json.user && typeof json.user === "object") {
    json.userId = json.user.id || json.user._id?.toString();
    json.farmerName = json.user.name;
    json.farmName = json.user.farmName || "";
    json.farmerEmail = json.user.email || "";
  }
  return json;
}

adminRouter.get("/users", async (_req, res, next) => {
  try {
    const [users, analysisCounts, loanCounts] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      Analysis.aggregate([{ $group: { _id: "$user", count: { $sum: 1 } } }]),
      LoanApplication.aggregate([{ $group: { _id: "$user", count: { $sum: 1 } } }])
    ]);

    const analysisCountByUser = new Map(analysisCounts.map((item) => [item._id.toString(), item.count]));
    const loanCountByUser = new Map(loanCounts.map((item) => [item._id.toString(), item.count]));
    res.json({
      users: users.map((user) => ({
        ...user.toJSON(),
        analysisCount: analysisCountByUser.get(user._id.toString()) || 0,
        loanCount: loanCountByUser.get(user._id.toString()) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/stats", async (_req, res, next) => {
  try {
    const [farmers, totalAnalyses, pending, reviewed, pendingLoans, approvedLoans, rejectedLoans, soilCounts] = await Promise.all([
      User.countDocuments({ role: "farmer" }),
      Analysis.countDocuments(),
      Analysis.countDocuments({ status: "pending" }),
      Analysis.countDocuments({ status: "reviewed" }),
      LoanApplication.countDocuments({ status: "pending" }),
      LoanApplication.countDocuments({ status: "approved" }),
      LoanApplication.countDocuments({ status: "rejected" }),
      Analysis.aggregate([{ $group: { _id: "$result.soilType", count: { $sum: 1 } } }])
    ]);

    res.json({
      stats: {
        farmers,
        totalAnalyses,
        pending,
        reviewed,
        pendingLoans,
        approvedLoans,
        rejectedLoans,
        soilCounts: Object.fromEntries(soilCounts.map((item) => [item._id || "Unknown", item.count]))
      }
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/users/:id/status", validateBody(userStatusSchema), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    ensureFarmer(user);

    user.isActive = req.body.isActive;
    await user.save();

    const [analysisCount, loanCount] = await Promise.all([
      Analysis.countDocuments({ user: user._id }),
      LoanApplication.countDocuments({ user: user._id })
    ]);

    res.json({ user: { ...user.toJSON(), analysisCount, loanCount } });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/users/:id/password", validateBody(adminPasswordResetSchema), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("+passwordHash");
    ensureFarmer(user);

    user.passwordHash = await bcrypt.hash(req.body.password, 12);
    await user.save();

    res.json({ message: "Farmer password updated" });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    ensureFarmer(user);

    await Promise.all([
      Analysis.deleteMany({ user: user._id }),
      LoanApplication.deleteMany({ user: user._id }),
      user.deleteOne()
    ]);

    res.json({ userId: req.params.id });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/loans/:id/status", validateBody(loanStatusSchema), async (req, res, next) => {
  try {
    const loan = await LoanApplication.findById(req.params.id);
    if (!loan) throw notFound("Loan application not found");

    loan.status = req.body.status;
    loan.adminNote = req.body.adminNote || loan.adminNote;
    loan.reviewedBy = req.user._id;
    loan.reviewedAt = new Date();
    await loan.save();

    const populated = await loan.populate("user", "name farmName email");
    res.json({ loan: serializeLoan(populated) });
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
