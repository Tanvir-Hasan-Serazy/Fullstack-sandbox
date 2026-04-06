import { Router } from "express";
// import authRoutes from "./auth.js";
import authRoutes from "./auth.routes.js";

const rootRouter = Router();

// rootRouter.use("/auth", authRoutes);
rootRouter.use("/auth", authRoutes);

export default rootRouter;
