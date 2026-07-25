import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, lowercase: true, trim: true },
    employeeId: { type: String, unique: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["admin", "employee"], default: "employee" },
    department: { type: String, required: true, enum: ["IT","HR","Finance","Sales","QA","Operations","Security",] },
    designation: { type: String, required: true },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    joinedAt: { type: Date, default: Date.now },
    // Replaced on every login so a user can have only one valid JWT at a time.
    sessionId: { type: String, default: null, select: false },
    sessionStartedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
