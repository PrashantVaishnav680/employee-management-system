import Leave from "../models/Leave.js";
import { logActivity } from "../utils/logActivity.js";
import { notifyUser } from "../utils/notify.js";

export const getLeaves = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { employee: req.user._id };
    const leaves = await Leave.find(query)
      .populate("employee", "name email department")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

export const createLeave = async (req, res, next) => {
  try {
    const leave = await Leave.create({ ...req.body, employee: req.user._id });
    await logActivity({ actor: req.user._id, action: "REQUEST_LEAVE", entity: "Leave", entityId: leave._id });
    res.status(201).json(leave);
  } catch (error) {
    next(error);
  }
};

export const reviewLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, reviewedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate("employee", "name email");
    if (!leave) {
      res.status(404);
      throw new Error("Leave request not found");
    }
    await notifyUser({ user: leave.employee._id, title: "Leave request updated", message: `Your leave was ${leave.status}` });
    await logActivity({ actor: req.user._id, action: "REVIEW_LEAVE", entity: "Leave", entityId: leave._id, details: leave.status });
    res.json(leave);
  } catch (error) {
    next(error);
  }
};
