import Task from "../models/Task.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const taskQuery = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const employeeQuery = { role: "employee" };
    const [employees, tasks, attendance, leaves] = await Promise.all([
      User.countDocuments(employeeQuery),
      Task.find(taskQuery),
      Attendance.find(req.user.role === "admin" ? {} : { employee: req.user._id }),
      Leave.find(req.user.role === "admin" ? {} : { employee: req.user._id }),
    ]);

    const statusCounts = ["New", "Active", "Completed", "Failed"].map((status) => ({
      name: status,
      value: tasks.filter((task) => task.status === status).length,
    }));
    const priorityCounts = ["Low", "Medium", "High"].map((priority) => ({
      name: priority,
      value: tasks.filter((task) => task.priority === priority).length,
    }));
    const attendanceCounts = ["Present", "Absent", "Half Day", "Remote"].map((status) => ({
      name: status,
      value: attendance.filter((record) => record.status === status).length,
    }));
    const leaveCounts = ["Pending", "Approved", "Rejected"].map((status) => ({
      name: status,
      value: leaves.filter((leave) => leave.status === status).length,
    }));
    const monthlyAttendance = attendance.filter((record) => {
      const now = new Date();
      const date = new Date(record.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const attendancePercentage = monthlyAttendance.length
      ? Math.round((monthlyAttendance.filter((item) => ["Present", "Remote", "Half Day"].includes(item.status)).length / monthlyAttendance.length) * 100)
      : 0;
    const taskTrend = Array.from({ length: 6 }, (_, index) => {
      const month = new Date(); month.setMonth(month.getMonth() - (5 - index));
      return {
        name: month.toLocaleString("en", { month: "short" }),
        value: tasks.filter((task) => task.status === "Completed" && new Date(task.updatedAt).getMonth() === month.getMonth() && new Date(task.updatedAt).getFullYear() === month.getFullYear()).length,
      };
    });

    res.json({
      totals: {
        employees,
        tasks: tasks.length,
        attendance: attendance.length,
        leaves: leaves.length,
        averageProgress: tasks.length ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length) : 0,
        monthlyAttendancePercentage: attendancePercentage,
      },
      statusCounts,
      priorityCounts,
      attendanceCounts,
      leaveCounts,
      taskTrend,
    });
  } catch (error) {
    next(error);
  }
};
