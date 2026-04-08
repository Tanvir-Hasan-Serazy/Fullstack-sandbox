import express from "express";
import userController from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, userController.getUserDetails);

export default router;
