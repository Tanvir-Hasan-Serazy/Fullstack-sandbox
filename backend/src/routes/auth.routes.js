import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../config/better-auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validateMiddlware.js";
import { registerWithPhoto } from "../controller/auth.controller.js";
import { registerSchema } from "../schemas/auth.schema.js";

const router = express.Router();

// Custom registration endpoint with image upload support
router.post(
  "/register",
  upload.single("profilePhoto"),
  validate(registerSchema),
  registerWithPhoto,
);

// Let better-auth handle all other authentication routes
// (sign-in, sign-out, get-session, etc.)
router.all("/{*any}", toNodeHandler(auth));

export default router;
