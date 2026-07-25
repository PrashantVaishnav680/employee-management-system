import Attendance from "../models/Attendance.js";
import { logActivity } from "../utils/logActivity.js";
import { isBeforeToday, startOfDay } from "../utils/date.js";
import User from "../models/User.js";
import { notifyUser } from "../utils/notify.js";

export const getAttendance = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { employee: req.user._id };
    if (req.query.employee && req.user.role === "admin") query.employee = req.query.employee;
    const records = await Attendance.find(query).populate("employee", "name email department").sort({ date: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

export const upsertAttendance = async (req, res, next) => {
  try {
    const employee = req.user.role === "admin" ? req.body.employee : req.user._id;
    const attendanceDate = startOfDay(req.body.date);
    if (!attendanceDate) { res.status(400); throw new Error("A valid attendance date is required"); }
    if (req.user.role !== "admin" && isBeforeToday(attendanceDate)) {
      res.status(400); throw new Error("Employees can only mark attendance for today or future dates");
    }
    if (req.user.role !== "admin" && await Attendance.exists({ employee, date: attendanceDate })) {
      res.status(409); throw new Error("Attendance has already been marked for this date");
    }
    const record = await Attendance.findOneAndUpdate(
      { employee, date: attendanceDate },
      { ...req.body, employee, date: attendanceDate },
      { new: true, upsert: true, runValidators: true }
    ).populate("employee", "name email department");

    await logActivity({ actor: req.user._id, action: "UPSERT_ATTENDANCE", entity: "Attendance", entityId: record._id });
    res.json(record);
  } catch (error) {
    next(error);
  }
};

export const bulkAttendance = async (req, res, next) => {
  try {
    const { date, attendance } = req.body;

    if (!date || !attendance || !attendance.length) {
      return res.status(400).json({
        message: "Attendance data is required",
      });
    }

    const attendanceDate = startOfDay(date);
    if (!attendanceDate) return res.status(400).json({ message: "A valid attendance date is required" });

    // Check if today's attendance is already locked
    const lockedCount = await Attendance.countDocuments({
      date: attendanceDate,
      locked: true,
    });

    if (lockedCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance already submitted for this date.",
      });
    }

    const operations = attendance.map((item) => ({
      updateOne: {
        filter: {
          employee: item.employee,
          date: attendanceDate,
        },
        update: {
          employee: item.employee,
          date: attendanceDate,
          status: item.status,
          checkIn: item.checkIn || "",
          checkOut: item.checkOut || "",
          notes: item.notes || "",

          locked: true,
          submittedBy: req.user._id,
          submittedAt: new Date(),
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    await logActivity({
      actor: req.user._id,
      action: "BULK_ATTENDANCE",
      entity: "Attendance",
      details: `${attendance.length} Employees`,
    });

    res.json({
      success: true,
      message: "Attendance submitted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const unlockAttendance = async (req, res, next) => {
  try {
    const attendanceDate = new Date(req.params.date);
    attendanceDate.setHours(0, 0, 0, 0);

    await Attendance.updateMany(
      {
        date: attendanceDate,
      },
      {
        locked: false,
      }
    );

    await logActivity({
      actor: req.user._id,
      action: "UNLOCK_ATTENDANCE",
      entity: "Attendance",
      details: attendanceDate.toDateString(),
    });

    res.json({
      success: true,
      message: "Attendance unlocked successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const sendAttendanceReminders = async (req, res, next) => {
  try {
    const date = startOfDay(req.body.date || new Date());
    const marked = await Attendance.find({ date }).distinct("employee");
    const employees = await User.find({ role: "employee", status: "active", _id: { $nin: marked } }).select("_id");
    await Promise.all(employees.map((employee) => notifyUser({
      user: employee._id,
      title: "Attendance reminder",
      message: `Please mark your attendance for ${date.toLocaleDateString()}.`,
    })));
    res.json({ message: `Reminder sent to ${employees.length} employee(s)` });
  } catch (error) { next(error); }
};
