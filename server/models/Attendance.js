import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Present", "Absent", "Half Day", "Remote"], required: true },
    checkIn: { type: String, default: "" },
    checkOut: { type: String, default: "" },
    notes: { type: String, default: "" },
    locked: {type: Boolean,default: false,},
    submittedBy: {type: mongoose.Schema.Types.ObjectId,ref: "User",},
    submittedAt: {type: Date,},
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
