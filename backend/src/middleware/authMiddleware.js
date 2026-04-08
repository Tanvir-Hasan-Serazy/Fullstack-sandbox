import { auth } from "../config/better-auth.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    req.user = session.user;
    req.session = session;

    next();
  } catch (error) {
    console.error("Auth middleware error", error);
    res.status(401).json({
      success: false,
      message: "Invalid session",
    });
  }
};
