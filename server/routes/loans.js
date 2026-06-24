import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { LoanApplication } from "../models/LoanApplication.js";
import { loanApplicationSchema } from "../validation/schemas.js";
import { HttpError } from "../utils/httpError.js";

export const loansRouter = Router();

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

loansRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user._id };
    const loans = await LoanApplication.find(query)
      .populate("user", "name farmName email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ loans: loans.map(serializeLoan) });
  } catch (error) {
    next(error);
  }
});

loansRouter.post("/", requireAuth, validateBody(loanApplicationSchema), async (req, res, next) => {
  try {
    if (req.user.role !== "farmer") throw new HttpError(403, "Only farmer accounts can apply for loans");

    const loan = await LoanApplication.create({
      user: req.user._id,
      amount: req.body.amount,
      purpose: req.body.purpose,
      crop: req.body.crop,
      landArea: req.body.landArea,
      landUnit: req.body.landUnit,
      tenureMonths: req.body.tenureMonths,
      farmerNote: req.body.farmerNote
    });

    const populated = await loan.populate("user", "name farmName email");
    res.status(201).json({ loan: serializeLoan(populated) });
  } catch (error) {
    next(error);
  }
});
