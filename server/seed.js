// this file is only used for data in local development and testing. It will delete all existing data in the database and create a new admin user, some employees, and some tasks. Do not use this file in production.

import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Task from "./models/Task.js";
import Attendance from "./models/Attendance.js";
import Leave from "./models/Leave.js";
import Notification from "./models/Notification.js";
import ActivityLog from "./models/ActivityLog.js";

dotenv.config();
await connectDB();

await Promise.all([
  User.deleteMany(),
  Task.deleteMany(),
  Attendance.deleteMany(),
  Leave.deleteMany(),
  Notification.deleteMany(),
  ActivityLog.deleteMany(),
]);

const admin = await User.create({
  name: "Prashant Vaishnav",
  email: "Prashant@ems.com",
  password: "Admin@123",
  role: "admin",
  department: "Operations",
  designation: "EMS Administrator",
});

const employees = await User.create([
  { name: "Aarav Patel", email: "aarav@ems.com", password: "Employee@123", role: "employee", department: "Frontend", designation: "React Developer" },
  { name: "Isha Rao", email: "isha@ems.com", password: "Employee@123", role: "employee", department: "QA", designation: "QA Engineer" },
  { name: "Rohan Kumar", email: "rohan@ems.com", password: "Employee@123", role: "employee", department: "Backend", designation: "Node Developer" },
]);

await Task.create([
  {
    title: "Regression test payroll module",
    description: "Execute regression suite and attach the issue summary.",
    category: "QA",
    priority: "High",
    status: "New",
    dueDate: new Date("2026-07-25"),
    estimatedHours: 6,
    assignedTo: employees[0]._id,
    createdBy: admin._id,
  },
  {
    title: "Build profile edit page",
    description: "Create responsive UI and wire it with profile API.",
    category: "Frontend",
    priority: "Medium",
    status: "Active",
    dueDate: new Date("2026-07-24"),
    estimatedHours: 8,
    progress: 45,
    assignedTo: employees[1]._id,
    createdBy: admin._id,
  },
  {
    title: "Optimize attendance endpoint",
    description: "Add filters and validate duplicate attendance entries.",
    category: "Backend",
    priority: "Medium",
    status: "Completed",
    dueDate: new Date("2026-07-20"),
    estimatedHours: 5,
    actualHours: 4,
    progress: 100,
    assignedTo: employees[2]._id,
    createdBy: admin._id,
  },
]);

await ActivityLog.create({ actor: admin._id, action: "SEED_DATABASE", entity: "System", details: "Initial EMS data created" });

console.log("Seed complete");
await mongoose.disconnect();
