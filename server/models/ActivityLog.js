import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, default: "" },
    details: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
