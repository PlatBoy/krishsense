import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { askFarmingAssistant } from "../services/gemini.js";
import { assistantChatSchema } from "../validation/schemas.js";

export const assistantRouter = Router();

assistantRouter.post("/chat", requireAuth, validateBody(assistantChatSchema), async (req, res, next) => {
  try {
    const answer = await askFarmingAssistant({
      question: req.body.question,
      context: req.body.context
    });

    res.json({ answer });
  } catch (error) {
    next(error);
  }
});
