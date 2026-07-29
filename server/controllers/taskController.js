import Task from "../models/Task.js";
import { logActivity } from "../utils/logActivity.js";
import { notifyUser } from "../utils/notify.js";
import { isBeforeToday, startOfDay } from "../utils/date.js";

const ownTaskOrAdmin = (req, task) => req.user.role === "admin" || String(task.assignedTo._id || task.assignedTo) === String(req.user._id);

export const getTasks = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    if (req.query.status) query.status = req.query.status;
    if (req.query.assignedTo && req.user.role === "admin") query.assignedTo = req.query.assignedTo;
    if (req.query.search) query.title = { $regex: req.query.search, $options: "i" };

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email department avatar")
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    if (isBeforeToday(req.body.dueDate)) {
      res.status(400); throw new Error("Task due date must be today or in the future");
    }
    const task = await Task.create({ ...req.body, dueDate: startOfDay(req.body.dueDate), createdBy: req.user._id });
    await notifyUser({ user: task.assignedTo, title: "New task assigned", message: task.title });
    await logActivity({ actor: req.user._id, action: "CREATE_TASK", entity: "Task", entityId: task._id, details: task.title });
    const populated = await task.populate("assignedTo", "name email department avatar");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }
    if (!ownTaskOrAdmin(req, task)) {
      res.status(403);
      throw new Error("Not allowed to update this task");
    }

    const allowedFields = req.user.role === "admin"
      ? ["title", "description", "category", "priority", "status", "dueDate", "estimatedHours", "actualHours", "progress", "remarks", "attachmentUrl", "assignedTo"]
      : ["status", "progress", "actualHours", "remarks"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

    if (!Object.keys(updates).length) {
      res.status(400);
      throw new Error("No permitted task fields were provided");
    }
    if (updates.dueDate && isBeforeToday(updates.dueDate)) {
      res.status(400); throw new Error("Task due date must be today or in the future");
    }
    Object.assign(task, updates);
    if (task.status === "Completed") task.progress = 100;
    if (task.status === "New") task.progress = 0;
    await task.save();

    await logActivity({ actor: req.user._id, action: "UPDATE_TASK", entity: "Task", entityId: task._id, details: task.title });
    const populated = await task.populate("assignedTo", "name email department avatar");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }
    await task.deleteOne();
    await logActivity({ actor: req.user._id, action: "DELETE_TASK", entity: "Task", entityId: task._id, details: task.title });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
