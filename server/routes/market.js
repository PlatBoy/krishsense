import mongoose from "mongoose";
import { Router } from "express";
import { MARKET_ITEMS, findMarketItem } from "../constants/marketItems.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { LoanApplication } from "../models/LoanApplication.js";
import { MarketOrder } from "../models/MarketOrder.js";
import { User } from "../models/User.js";
import { loanRepaymentSchema, marketOrderSchema } from "../validation/schemas.js";
import { HttpError } from "../utils/httpError.js";

export const marketRouter = Router();

function ensureFarmer(req) {
  if (req.user.role !== "farmer") throw new HttpError(403, "Only farmer accounts can use the market");
}

function maskAccountNumber(accountNumber) {
  return accountNumber.slice(-4);
}

async function getMarketSnapshot(userId) {
  const [user, orders, loans] = await Promise.all([
    User.findById(userId),
    MarketOrder.find({ user: userId }).sort({ createdAt: -1 }).limit(50),
    LoanApplication.find({ user: userId, status: "approved" }).sort({ createdAt: -1 }).limit(50)
  ]);

  return {
    account: {
      walletBalance: user?.walletBalance || 0
    },
    catalog: MARKET_ITEMS,
    orders: orders.map((order) => order.toJSON()),
    loans: loans.map((loan) => loan.toJSON())
  };
}

marketRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    ensureFarmer(req);
    res.json(await getMarketSnapshot(req.user._id));
  } catch (error) {
    next(error);
  }
});

marketRouter.get("/catalog", requireAuth, (_req, res) => {
  res.json({ catalog: MARKET_ITEMS });
});

marketRouter.post("/orders", requireAuth, validateBody(marketOrderSchema), async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    ensureFarmer(req);

    const item = findMarketItem(req.body.itemId);
    if (!item) throw new HttpError(404, "Market item not found");

    const totalPrice = item.price * req.body.quantity;
    let order;
    let user;

    await session.withTransaction(async () => {
      user = await User.findOneAndUpdate(
        { _id: req.user._id, walletBalance: { $gte: totalPrice } },
        { $inc: { walletBalance: -totalPrice } },
        { new: true, session }
      );
      if (!user) throw new HttpError(400, "Not enough account balance for this purchase");

      [order] = await MarketOrder.create(
        [
          {
            user: req.user._id,
            itemId: item.id,
            itemName: item.name,
            category: item.category,
            unit: item.unit,
            quantity: req.body.quantity,
            unitPrice: item.price,
            totalPrice
          }
        ],
        { session }
      );
    });

    res.status(201).json({
      order: order.toJSON(),
      account: { walletBalance: user.walletBalance }
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

marketRouter.post("/repayments", requireAuth, validateBody(loanRepaymentSchema), async (req, res, next) => {
  try {
    ensureFarmer(req);

    const loan = await LoanApplication.findOne({
      _id: req.body.loanId,
      user: req.user._id,
      status: "approved"
    });
    if (!loan) throw new HttpError(404, "Approved loan not found");

    const remainingAmount = Math.max(0, loan.amount - loan.repaidAmount);
    if (remainingAmount <= 0) throw new HttpError(400, "This loan is already fully repaid");
    if (req.body.amount > remainingAmount) throw new HttpError(400, `Repayment cannot exceed remaining amount of ${remainingAmount}`);

    loan.repaidAmount += req.body.amount;
    loan.repaymentStatus = loan.repaidAmount >= loan.amount ? "paid" : "partial";
    loan.repayments.push({
      amount: req.body.amount,
      bankName: req.body.bankName,
      accountName: req.body.accountName,
      accountLast4: maskAccountNumber(req.body.accountNumber),
      ifsc: req.body.ifsc
    });
    await loan.save();

    res.json({ loan: loan.toJSON() });
  } catch (error) {
    next(error);
  }
});
