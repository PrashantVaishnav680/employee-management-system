import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const taskMatch = isAdmin ? {} : { assignedTo: req.user._id };
    const attendanceMatch = isAdmin ? {} : { employee: req.user._id };
    const leaveMatch = isAdmin ? {} : { employee: req.user._id };

    // Run all aggregations in parallel for speed
    const [
      employeeCount,
      taskAgg,
      attendanceAgg,
      leaveAgg,
      taskProgressAgg,
      monthlyAttendanceAgg,
      taskTrendAgg,
    ] = await Promise.all([
      // Total active employees
      User.countDocuments({ role: "employee", status: "active" }),

      // Task counts by status
      Task.aggregate([
        { $match: taskMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Attendance counts by status
      Attendance.aggregate([
        { $match: attendanceMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Leave counts by status
      Leave.aggregate([
        { $match: leaveMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Average task progress
      Task.aggregate([
        { $match: taskMatch },
        { $group: { _id: null, total: { $sum: 1 }, avgProgress: { $avg: "$progress" } } },
      ]),

      // Monthly attendance percentage (current month)
      (() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return Attendance.aggregate([
          { $match: { ...attendanceMatch, date: { $gte: monthStart, $lt: monthEnd } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              present: {
                $sum: { $cond: [{ $in: ["$status", ["Present", "Remote", "Half Day"]] }, 1, 0] },
              },
            },
          },
        ]);
      })(),

      // Task completion trend — last 6 months
      Task.aggregate([
        {
          $match: {
            ...taskMatch,
            status: "Completed",
            updatedAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$updatedAt" },
              month: { $month: "$updatedAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    // --- Shape aggregation results into response format ---

    const toMap = (agg) => Object.fromEntries(agg.map((g) => [g._id, g.count]));

    const taskMap = toMap(taskAgg);
    const attendanceMap = toMap(attendanceAgg);
    const leaveMap = toMap(leaveAgg);

    const statusCounts = ["New", "Active", "Completed", "Failed"].map((status) => ({
      name: status,
      value: taskMap[status] || 0,
    }));
    const priorityAgg = await Task.aggregate([
      { $match: taskMatch },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);
    const priorityMap = toMap(priorityAgg);
    const priorityCounts = ["Low", "Medium", "High"].map((p) => ({
      name: p,
      value: priorityMap[p] || 0,
    }));
    const attendanceCounts = ["Present", "Absent", "Half Day", "Remote"].map((status) => ({
      name: status,
      value: attendanceMap[status] || 0,
    }));
    const leaveCounts = ["Pending", "Approved", "Rejected"].map((status) => ({
      name: status,
      value: leaveMap[status] || 0,
    }));

    const totalTasks = taskProgressAgg[0]?.total || 0;
    const averageProgress = totalTasks
      ? Math.round(taskProgressAgg[0]?.avgProgress || 0)
      : 0;

    const monthly = monthlyAttendanceAgg[0];
    const monthlyAttendancePercentage = monthly?.total
      ? Math.round((monthly.present / monthly.total) * 100)
      : 0;

    // Build 6-month trend, filling in zeros for months with no completions
    const trendMap = {};
    for (const entry of taskTrendAgg) {
      trendMap[`${entry._id.year}-${entry._id.month}`] = entry.count;
    }
    const taskTrend = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      return {
        name: d.toLocaleString("en", { month: "short" }),
        value: trendMap[key] || 0,
      };
    });

    const totalAttendance = Object.values(attendanceMap).reduce((s, v) => s + v, 0);
    const totalLeaves = Object.values(leaveMap).reduce((s, v) => s + v, 0);

    res.json({
      totals: {
        employees: employeeCount,
        tasks: totalTasks,
        attendance: totalAttendance,
        leaves: totalLeaves,
        averageProgress,
        monthlyAttendancePercentage,
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
