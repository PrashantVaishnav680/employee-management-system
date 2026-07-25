import express from "express";
import { changePassword, getSessions, login, logout, me, revokeSession } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { loginLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", loginLimiter, login);
router.post("/logout", protect, logout);
router.get("/me", protect, me);
router.patch("/change-password", protect, changePassword);
router.get("/sessions", protect, getSessions);
router.post("/sessions/revoke", protect, revokeSession);

export default router;
