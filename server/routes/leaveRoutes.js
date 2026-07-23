import express from "express";
import { createLeave, getLeaves, reviewLeave } from "../controllers/leaveController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getLeaves);
router.post("/", protect, authorize("employee"), createLeave);
router.patch("/:id/review", protect, authorize("admin"), reviewLeave);

export default router;
