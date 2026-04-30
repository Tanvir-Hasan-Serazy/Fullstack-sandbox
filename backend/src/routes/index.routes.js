import { Router } from "express";
// import authRoutes from "./auth.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import paymentRoutes from "./payment.js";

const rootRouter = Router();

// rootRouter.use("/auth", authRoutes);
rootRouter.use("/auth", authRoutes);
rootRouter.use("/user", userRoutes);
rootRouter.use("/payments", paymentRoutes);

// Other inactive routes (commented out)
// router.use("/books", booksRoutes);
// router.use("/id", idRoutes);
// router.use("/products", productsRoutes);

export default rootRouter;
