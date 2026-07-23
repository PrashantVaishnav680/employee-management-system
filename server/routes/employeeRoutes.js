import express from "express";
import { createEmployee, deleteEmployee, getEmployees, resetEmployeePassword, updateEmployee, updateProfile } from "../controllers/employeeController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getEmployees);
router.post("/", protect, authorize("admin"), createEmployee);
router.patch("/profile", protect, updateProfile);
router.patch("/:id/reset-password", protect, authorize("admin"), resetEmployeePassword);
router.patch("/:id", protect, authorize("admin"), updateEmployee);
router.delete("/:id", protect, authorize("admin"), deleteEmployee);

export default router;
