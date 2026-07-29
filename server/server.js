import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import activityRoutes from "./routes/activityRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import User from "./models/User.js";
import helmet from "helmet";



dotenv.config();

const bootstrapUsers = async () => {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) return;

  await User.create({
    name: "Prashant Vaishnav",
    email: "Prashant@ems.com",
    password: "Admin@123",
    role: "admin",
    department: "Operations",
    designation: "EMS Administrator",
  });

  await User.create([
    { name: "Aarav Patel", email: "aarav@ems.com", password: "Employee@123", role: "employee", department: "Frontend", designation: "React Developer" },
    { name: "Isha Rao", email: "isha@ems.com", password: "Employee@123", role: "employee", department: "QA", designation: "QA Engineer" },
    { name: "Rohan Kumar", email: "rohan@ems.com", password: "Employee@123", role: "employee", department: "Backend", designation: "Node Developer" },
  ]);
};

await connectDB();
await bootstrapUsers();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(helmet());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EMS Backend API is running 🚀",
  });
});
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "EMS API" }));
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`EMS API running on port ${PORT}`));
