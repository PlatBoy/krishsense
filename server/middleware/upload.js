import multer from "multer";
import { HttpError } from "../utils/httpError.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const uploadSoilPhoto = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (allowedMimeTypes.has(file.mimetype)) callback(null, true);
    else callback(new HttpError(400, "Upload a JPEG, PNG, or WebP soil photo."));
  }
});
