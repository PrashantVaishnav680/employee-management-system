import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    loginAt: { type: Date, default: Date.now },
    logoutAt: { type: Date, default: null },
    device: { type: String, default: "Unknown device" },
    browser: { type: String, default: "Unknown browser" },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("LoginHistory", loginHistorySchema);
