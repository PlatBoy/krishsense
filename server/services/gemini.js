import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

const soilColors = {
  Clay: "#6c6258",
  Sandy: "#c7a66d",
  Loamy: "#8a5a36",
  Silty: "#8f8172",
  Peaty: "#4a3428",
  Chalky: "#d6c8a8",
  Laterite: "#a33d2e",
  Alluvial: "#9a6b3f",
  Unknown: "#8a5a36"
};

const responseSchema = {
  type: "object",
  properties: {
    soilType: {
      type: "string",
      enum: ["Clay", "Sandy", "Loamy", "Silty", "Peaty", "Chalky", "Laterite", "Alluvial", "Unknown"]
    },
    confidence: { type: "number", minimum: 0, maximum: 100 },
    texture: { type: "string" },
    visibleColor: { type: "string" },
    summary: { type: "string" },
    healthScore: { type: "number", minimum: 0, maximum: 100 },
    riskLevel: { type: "string", enum: ["Low", "Medium", "High"] },
    nutrients: { type: "array", items: { type: "string" } },
    cropSuitability: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    warnings: { type: "array", items: { type: "string" } },
    irrigation: { type: "string" }
  },
  required: [
    "soilType",
    "confidence",
    "texture",
    "visibleColor",
    "summary",
    "healthScore",
    "riskLevel",
    "nutrients",
    "cropSuitability",
    "recommendations",
    "warnings",
    "irrigation"
  ],
  propertyOrdering: [
    "soilType",
    "confidence",
    "texture",
    "visibleColor",
    "summary",
    "healthScore",
    "riskLevel",
    "nutrients",
    "cropSuitability",
    "recommendations",
    "warnings",
    "irrigation"
  ]
};

function parseJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini returned a non-JSON soil analysis.");
    return JSON.parse(match[0]);
  }
}

function localAssistantAnswer(question, context = {}) {
  const soil = context.soilType || "your current soil";
  const crop = context.crop || "the selected crop";
  const health = context.healthScore ? ` Your latest soil health score is ${context.healthScore}.` : "";
  const lowerQuestion = String(question || "").toLowerCase();
  const lines = [];

  if (lowerQuestion.includes("fertil") || lowerQuestion.includes("urea") || lowerQuestion.includes("dap")) {
    lines.push(`For ${crop} in ${soil}, start with a balanced dose and avoid adding only urea.`);
    lines.push("Use compost/FYM first, then apply NPK in split doses after irrigation or light rain.");
  } else if (lowerQuestion.includes("water") || lowerQuestion.includes("irrigat") || lowerQuestion.includes("rain")) {
    lines.push(`For ${soil}, irrigate only when the top soil starts drying and the crop shows need.`);
    lines.push("Avoid watering before heavy rain, and do not keep water standing unless the crop needs it.");
  } else if (lowerQuestion.includes("crop") || lowerQuestion.includes("grow")) {
    lines.push(`${soil} can support good crops if drainage, pH, and organic matter are managed.`);
    lines.push("Choose crops based on local mandi demand, water availability, and your latest soil report.");
  } else {
    lines.push(`For ${crop} in ${soil}, follow your soil report first and keep the field evenly moist.`);
    lines.push("Add organic matter, watch for nutrient deficiency, and avoid sudden heavy chemical doses.");
  }

  lines.push(`${health}Confirm exact fertilizer and pH correction with a local soil test when possible.`.trim());
  lines.push("Gemini is not reachable right now, so this is a built-in KrishiSense fallback answer.");
  return lines.join("\n");
}

export async function analyzeSoilPhoto({ file, input = {}, type = "soil_identifier" }) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required for AI soil photo analysis.");
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const base64Image = file.buffer.toString("base64");
  const prompt = `
You are an agronomy assistant analyzing a farmer's soil photo.
Classify the visible soil into one of: Clay, Sandy, Loamy, Silty, Peaty, Chalky, Laterite, Alluvial, Unknown.
Return a practical farmer-facing result. If the image is not soil or too unclear, set soilType to Unknown, confidence below 45, and explain why.

Context:
- Feature: ${type}
- Crop grown: ${input.crop || "not provided"}
- Location: ${input.location || "not provided"}
- Land type: ${input.landType || "not provided"}
- Farmer notes: ${input.notes || "not provided"}
- Optional observed texture: ${input.texture || "not provided"}
- Optional observed drainage: ${input.drainage || "not provided"}
- Optional observed pH: ${input.ph || "not provided"}
`;

  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: file.mimetype, data: base64Image } },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.2
    }
  });

  const parsed = parseJsonResponse(response.text || "{}");
  const soilType = parsed.soilType || "Unknown";
  const confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || 0));
  const healthScore = Math.max(0, Math.min(100, Number(parsed.healthScore) || 70));

  return {
    soilType,
    confidence,
    healthScore,
    riskLevel: parsed.riskLevel || "Medium",
    soilColor: soilColors[soilType] || soilColors.Unknown,
    texture: parsed.texture || "",
    summary: parsed.summary || "The model could not produce a detailed soil summary.",
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 6) : [],
    nutrients: Array.isArray(parsed.nutrients) ? parsed.nutrients.slice(0, 5) : [],
    irrigation: parsed.irrigation || "",
    bestCrops: Array.isArray(parsed.cropSuitability) ? parsed.cropSuitability.slice(0, 6) : [],
    alerts: Array.isArray(parsed.warnings) ? parsed.warnings.slice(0, 5) : [],
    note: "AI photo analysis is guidance only. Confirm fertilizer and pH decisions with a lab soil test.",
    model: env.GEMINI_MODEL,
    raw: parsed
  };
}

export async function askFarmingAssistant({ question, context = {} }) {
  if (!env.GEMINI_API_KEY) {
    return localAssistantAnswer(question, context);
  }

  const prompt = `
You are KrishiSense, a practical farming assistant for Indian farmers.
Answer simply in 4 to 6 short lines. Give safe, practical guidance.
Do not claim to replace a government officer, agronomist, bank, or lab test.

Farmer context:
- Soil type: ${context.soilType || "not provided"}
- Crop: ${context.crop || "not provided"}
- Location: ${context.location || "not provided"}
- Soil health score: ${context.healthScore || "not provided"}

Question: ${question}
`;

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.35,
        maxOutputTokens: 280
      }
    });

    return (response.text || localAssistantAnswer(question, context)).trim();
  } catch {
    return localAssistantAnswer(question, context);
  }
}
