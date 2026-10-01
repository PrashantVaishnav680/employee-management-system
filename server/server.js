import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import User from "./models/User.js";
import activityRoutes from "./routes/activityRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

// ---------------------------------------------------------------------------
// Seed admin + sample employees on first run (only if DB is empty).
// Passwords are read from .env — never hardcoded in source.
// ---------------------------------------------------------------------------
const seedDefaultUsers = async () => {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) return;

  const adminPass = process.env.SEED_ADMIN_PASSWORD;
  const empPass = process.env.SEED_EMPLOYEE_PASSWORD;

  if (!adminPass || !empPass) {
    console.warn(
      "[SEED] SEED_ADMIN_PASSWORD / SEED_EMPLOYEE_PASSWORD not set in .env — skipping default user creation."
    );
    return;
  }

  await User.create({
    name: "Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@ems.com",
    password: adminPass,
    role: "admin",
    department: "Operations",
    designation: "EMS Administrator",
  });

  await User.create([
    { name: "Aarav Patel", email: "aarav@ems.com", password: empPass, role: "employee", department: "IT", designation: "Frontend Developer" },
    { name: "Isha Rao", email: "isha@ems.com", password: empPass, role: "employee", department: "QA", designation: "QA Engineer" },
    { name: "Rohan Kumar", email: "rohan@ems.com", password: empPass, role: "employee", department: "IT", designation: "Backend Developer" },
  ]);

  console.log("[SEED] Default users created.");
};

// ---------------------------------------------------------------------------
// Connect to MongoDB, then seed, then start Express
// ---------------------------------------------------------------------------
await connectDB();
await seedDefaultUsers();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Request parsing
app.use(express.json());
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Health / root
app.get("/", (_req, res) => res.json({ success: true, message: "EMS WorkPulse API 🚀" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "EMS API" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`EMS API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`));
