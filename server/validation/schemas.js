import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
  farmName: z.string().trim().max(160).optional().default(""),
  phone: z.string().trim().max(40).optional().default("")
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1)
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128)
});

export const adminPasswordResetSchema = z.object({
  password: z.string().min(8).max(128)
});

export const userStatusSchema = z.object({
  isActive: z.boolean()
});

const optionalText = z.string().trim().max(500).optional().default("");

export const analysisInputSchema = z.object({
  landArea: z.string().trim().max(40).optional().default(""),
  landUnit: z.enum(["acre", "hectare", "bigha"]).optional().default("acre"),
  landType: z
    .enum(["irrigated", "dryland", "lowland", "hilly", "river_belt", "plain"])
    .optional()
    .default("irrigated"),
  crop: z.string().trim().min(1).max(120),
  location: z.string().trim().max(160).optional().default(""),
  soilColor: z.string().trim().max(80).optional().default(""),
  texture: z.string().trim().max(80).optional().default(""),
  drainage: z.enum(["good", "moderate", "poor"]).optional().default("moderate"),
  ph: z.string().trim().max(10).optional().default(""),
  notes: optionalText
});

export const identifierInputSchema = z.object({
  landType: z
    .enum(["irrigated", "dryland", "lowland", "hilly", "river_belt", "plain", "unknown"])
    .optional()
    .default("unknown"),
  location: z.string().trim().max(160).optional().default(""),
  crop: z.string().trim().max(120).optional().default(""),
  notes: optionalText
});

export const statusSchema = z.object({
  status: z.enum(["pending", "reviewed", "follow_up"]),
  adminNote: z.string().trim().max(500).optional().default("")
});

export const loanApplicationSchema = z.object({
  amount: z.coerce.number().min(1000).max(10000000),
  purpose: z.string().trim().min(3).max(200),
  crop: z.string().trim().max(120).optional().default(""),
  landArea: z.string().trim().max(40).optional().default(""),
  landUnit: z.enum(["acre", "hectare", "bigha"]).optional().default("acre"),
  tenureMonths: z.coerce.number().int().min(1).max(120),
  farmerNote: z.string().trim().max(700).optional().default("")
});

export const loanStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  adminNote: z.string().trim().max(700).optional().default("")
});

export const marketOrderSchema = z.object({
  itemId: z.string().trim().min(2).max(80),
  quantity: z.coerce.number().int().min(1).max(100)
});

export const loanRepaymentSchema = z.object({
  loanId: z.string().trim().min(12).max(40),
  amount: z.coerce.number().min(1).max(10000000),
  bankName: z.string().trim().min(2).max(120),
  accountName: z.string().trim().min(2).max(120),
  accountNumber: z.string().trim().regex(/^\d{6,18}$/, "Use 6 to 18 bank account digits."),
  ifsc: z.string().trim().min(4).max(20).transform((value) => value.toUpperCase())
});

export const assistantChatSchema = z.object({
  question: z.string().trim().min(3).max(700),
  context: z
    .object({
      soilType: z.string().trim().max(80).optional().default(""),
      crop: z.string().trim().max(120).optional().default(""),
      location: z.string().trim().max(160).optional().default(""),
      healthScore: z.union([z.string(), z.number()]).optional().default("")
    })
    .optional()
    .default({})
});
