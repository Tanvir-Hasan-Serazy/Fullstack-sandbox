import { Router } from "express";
import { login, signup } from "../controller/auth.controller.js";

const authRoutes = Router();

authRoutes.get("/login", login);
authRoutes.get("/signup", signup);

export default authRoutes;
