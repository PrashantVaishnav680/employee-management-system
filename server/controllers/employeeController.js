import User from "../models/User.js";
import Task from "../models/Task.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import { logActivity } from "../utils/logActivity.js";

export const getEmployees = async (req, res, next) => {
  try {
    const query = req.query.search
      ? { role: "employee", status: "active", name: { $regex: req.query.search, $options: "i" } }
      : { role: "employee", status: "active" };
    const employees = await User.find(query).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const exists = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (exists) {
      res.status(409);
      throw new Error("Email already exists");
    }

    // Generate Employee ID
    const lastEmployee = await User.findOne({
      employeeId: { $exists: true }
    }).sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastEmployee?.employeeId) {
      nextNumber =
        parseInt(lastEmployee.employeeId.replace("EMP", "")) + 1;
    }

    const employeeId =
      `EMP${String(nextNumber).padStart(3, "0")}`;

    const employee = await User.create({
      ...req.body,
      employeeId,
      role: "employee",
    });
    
    await logActivity({ actor: req.user._id, action: "CREATE_EMPLOYEE", entity: "User", entityId: employee._id, details: employee.name });
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const safeUpdates = { ...req.body };
    delete safeUpdates.password;
    delete safeUpdates.role;
    const employee = await User.findByIdAndUpdate(req.params.id, safeUpdates, { new: true, runValidators: true });
    if (!employee) {
      res.status(404);
      throw new Error("Employee not found");
    }
    await logActivity({ actor: req.user._id, action: "UPDATE_EMPLOYEE", entity: "User", entityId: employee._id, details: employee.name });
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const resetEmployeePassword = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id).select("+password");
    if (!employee || employee.role !== "employee") {
      res.status(404);
      throw new Error("Employee not found");
    }

    employee.password = req.body.newPassword;
    await employee.save();
    await logActivity({ actor: req.user._id, action: "RESET_EMPLOYEE_PASSWORD", entity: "User", entityId: employee._id, details: employee.email });
    res.json({ message: "Employee password reset successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      res.status(404);
      throw new Error("Employee not found");
    }

    employee.status = "inactive";
    employee.sessionId = null;
    employee.sessionStartedAt = null;
    await employee.save({ validateBeforeSave: false });
    await logActivity({ actor: req.user._id, action: "DEACTIVATE_EMPLOYEE", entity: "User", entityId: employee._id, details: employee.name });
    res.json({ message: "Employee deactivated successfully. Historical records were retained." });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "department", "designation"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (error) {
    next(error);
  }
};
