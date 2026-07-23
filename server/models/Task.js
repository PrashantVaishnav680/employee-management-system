import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: { type: String, enum: ["New", "Active", "Completed", "Failed"], default: "New" },
    dueDate: { type: Date, required: true },
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    remarks: { type: String, default: "" },
    attachmentUrl: { type: String, default: "" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
