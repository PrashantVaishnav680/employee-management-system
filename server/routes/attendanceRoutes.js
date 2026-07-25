import express from "express";
import {
  getAttendance,
  upsertAttendance,
  bulkAttendance,
  unlockAttendance,
  sendAttendanceReminders,
} from "../controllers/attendanceController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getAttendance);
router.post("/", protect, upsertAttendance);

// NEW Bulk Attendance API
router.post(
  "/bulk",
  protect,
  authorize("admin"),
  bulkAttendance
);

// NEW Unlock API
router.patch(
  "/unlock/:date",
  protect,
  authorize("admin"),
  unlockAttendance
);
router.post("/reminders", protect, authorize("admin"), sendAttendanceReminders);

export default router;
