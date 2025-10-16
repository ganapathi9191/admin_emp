import Attendance from "../models/attendanceModel.js";
import Staff from "../models/staffModel.js";

// ================= CREATE ATTENDANCE =================
export const createAttendance = async (req, res) => {
  try {
    const { staffId, date, status, dayType, hoursWorked, workedHours } = req.body;
    const actualHours = hoursWorked || workedHours;

    if (!staffId || !date || !status)
      return res.status(400).json({
        success: false,
        message: "staffId, date, and status are required",
      });

    // Fetch staff by MongoDB _id
    const staff = await Staff.findById(staffId);
    if (!staff)
      return res.status(404).json({ success: false, message: "Staff not found" });

    // Validate day type
    if (status === "present" && !dayType)
      return res.status(400).json({
        success: false,
        message: "Day type is required when status is present",
      });

    if (status === "present" && dayType === "halfDay" && !actualHours)
      return res.status(400).json({
        success: false,
        message: "Hours worked are required for half-day attendance",
      });

    // Prevent duplicate attendance for same staff & date
    const existingAttendance = await Attendance.findOne({
      staff: staff._id,
      date: new Date(date),
    });
    if (existingAttendance)
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this date",
      });

    // Create attendance
    const attendance = await Attendance.create({
      staff: staff._id,
      staffId: staff._id,
      name: staff.staffName,
      date,
      status,
      dayType,
      hoursWorked: actualHours,
    });

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error creating attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error creating attendance",
      error: error.message,
    });
  }
};

// ================= GET ALL ATTENDANCE =================
export const getAllAttendance = async (req, res) => {
  try {
    const data = await Attendance.find()
      .populate("staff", "staffName email role")
      .sort({ date: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};

// ================= GET ATTENDANCE BY ID =================
export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("staff", "staffName email role");
    if (!attendance)
      return res.status(404).json({ success: false, message: "Attendance not found" });

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};

// ================= GET ATTENDANCE BY STAFF ID =================
export const getAttendanceByStaffId = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId);
    if (!staff)
      return res.status(404).json({ success: false, message: "Staff not found" });

    const attendance = await Attendance.find({ staff: staff._id })
      .populate("staff", "staffName email role")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};

// ================= UPDATE ATTENDANCE BY ID =================
export const updateAttendanceById = async (req, res) => {
  try {
    const { date, status, dayType, hoursWorked, workedHours } = req.body;
    const actualHours = hoursWorked || workedHours;

    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      { date, status, dayType, hoursWorked: actualHours },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Attendance not found" });

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating attendance",
      error: error.message,
    });
  }
};

// ================= DELETE ATTENDANCE BY ID =================
export const deleteAttendanceById = async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Attendance not found" });

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting attendance",
      error: error.message,
    });
  }
};
