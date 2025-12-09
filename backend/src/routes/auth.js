import { Router } from "express";
import { login, signup } from "../controller/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/signup", signup);

export default authRoutes;
