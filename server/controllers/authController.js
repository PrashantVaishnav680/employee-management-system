import User from "../models/User.js";
import { sendToken } from "../utils/token.js";
import { logActivity } from "../utils/logActivity.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    await logActivity({ actor: user._id, action: "LOGIN", entity: "Auth", details: `${user.name} logged in` });
    sendToken(res, user);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export const me = async (req, res) => {
  res.json(req.user);
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
    await user.save();
    await logActivity({ actor: user._id, action: "CHANGE_PASSWORD", entity: "Auth", details: "Password changed" });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
