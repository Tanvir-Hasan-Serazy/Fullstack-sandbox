import { Router } from "express";
// import authRoutes from "./auth.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

const rootRouter = Router();

// rootRouter.use("/auth", authRoutes);
rootRouter.use("/auth", authRoutes);
rootRouter.use("/user", userRoutes);

export default rootRouter;
