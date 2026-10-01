import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Token is ONLY accepted from the HttpOnly cookie.
    // We no longer accept Authorization: Bearer header to prevent
    // sharing tokens copied from localStorage between multiple users.
    const token = req.cookies?.token;

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, token missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password +sessionId");

    // Verify user exists, is active, and session ID matches what's in DB.
    // This ensures only the MOST RECENT login session is valid — logging in
    // from a new device invalidates all previous sessions.
    if (
      !user ||
      user.status !== "active" ||
      !decoded.sessionId ||
      user.sessionId !== decoded.sessionId
    ) {
      res.status(401);
      throw new Error("Your session has expired or was signed in elsewhere");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("You do not have permission for this action"));
    }
    next();
  };
};
