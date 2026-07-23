import express from "express";
import { changePassword, login, logout, me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { loginLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", protect, me);
router.patch("/change-password", protect, changePassword);

export default router;
