import express from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/taskController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, authorize("admin"), createTask);
router.patch("/:id", protect, updateTask);
router.delete("/:id", protect, authorize("admin"), deleteTask);

export default router;
