import User from "../models/User.js";
import { sendToken } from "../utils/token.js";
import { logActivity } from "../utils/logActivity.js";
import LoginHistory from "../models/LoginHistory.js";
import crypto from "crypto";

const getClientInfo = (req) => ({
  device: req.headers["user-agent"] || "Unknown device",
  browser: req.headers["sec-ch-ua"] || "Unknown browser",
  ipAddress: req.ip || req.socket?.remoteAddress || "",
});

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    user.sessionId = crypto.randomUUID();
    user.sessionStartedAt = new Date();
    await user.save({ validateBeforeSave: false });
    await LoginHistory.create({ user: user._id, sessionId: user.sessionId, ...getClientInfo(req) });
    await logActivity({ actor: user._id, action: "LOGIN", entity: "Auth", details: `${user.name} logged in` });
    sendToken(res, user);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await LoginHistory.findOneAndUpdate({ user: req.user._id, sessionId: req.user.sessionId, logoutAt: null }, { logoutAt: new Date() });
      await User.findByIdAndUpdate(req.user._id, { sessionId: null, sessionStartedAt: null });
    }
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
  } catch (error) { next(error); }
};

export const me = async (req, res) => {
  const user = req.user.toObject();
  delete user.sessionId;
  res.json(user);
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.matchPassword(currentPassword))) {
      res.status(400);
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    user.sessionId = null;
    user.sessionStartedAt = null;
    await user.save();
    await logActivity({ actor: user._id, action: "CHANGE_PASSWORD", entity: "Auth", details: "Password changed" });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const history = await LoginHistory.find({ user: req.user._id }).sort({ loginAt: -1 }).limit(20);
    res.json(history.map((item) => ({ ...item.toObject(), active: item.sessionId === req.user.sessionId && !item.logoutAt })));
  } catch (error) { next(error); }
};

export const revokeSession = async (req, res, next) => {
  try {
    const target = req.user.role === "admin" && req.body.userId ? req.body.userId : req.user._id;
    await User.findByIdAndUpdate(target, { sessionId: null, sessionStartedAt: null });
    await LoginHistory.updateMany({ user: target, logoutAt: null }, { logoutAt: new Date() });
    res.json({ message: "Active session revoked" });
  } catch (error) { next(error); }
};
