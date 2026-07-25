import Leave from "../models/Leave.js";
import { logActivity } from "../utils/logActivity.js";
import { notifyUser } from "../utils/notify.js";
import { isBeforeToday, startOfDay } from "../utils/date.js";

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
    const fromDate = startOfDay(req.body.fromDate);
    const toDate = startOfDay(req.body.toDate);
    if (!fromDate || !toDate || isBeforeToday(fromDate) || isBeforeToday(toDate)) {
      res.status(400); throw new Error("Leave dates must be today or in the future");
    }
    if (toDate < fromDate) {
      res.status(400); throw new Error("To date cannot be before from date");
    }
    const duplicate = await Leave.exists({
      employee: req.user._id,
      status: { $in: ["Pending", "Approved"] },
      fromDate: { $lte: toDate },
      toDate: { $gte: fromDate },
    });
    if (duplicate) {
      res.status(409); throw new Error("You already have a pending or approved leave for one of these dates");
    }
    const leave = await Leave.create({ ...req.body, fromDate, toDate, employee: req.user._id });
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
