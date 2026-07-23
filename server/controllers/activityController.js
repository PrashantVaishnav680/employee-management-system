import ActivityLog from "../models/ActivityLog.js";

export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find().populate("actor", "name email role").sort({ createdAt: -1 }).limit(80);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
