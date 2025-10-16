import Attendance from "../models/attendanceModel.js";

// ✅ Create Attendance
export const createAttendance = async (req, res) => {
  try {
    const { name, date, status, dayType, hoursWorked } = req.body;

    // Validation
    if (!name || !date || !status)
      return res
        .status(400)
        .json({ success: false, message: "Name, date, and status are required" });

    if (status === "present" && !dayType)
      return res
        .status(400)
        .json({ success: false, message: "Day type is required when present" });

    if (status === "present" && dayType === "halfDay" && !hoursWorked)
      return res
        .status(400)
        .json({
          success: false,
          message: "Hours worked are required for half-day attendance",
        });

    const attendance = await Attendance.create({
      name,
      date,
      status,
      dayType,
      hoursWorked,
    });

    res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error", error: error.message });
  }
};

// ✅ Get All Attendance
export const getAllAttendance = async (req, res) => {
  try {
    const data = await Attendance.find();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error", error: error.message });
  }
};

// ✅ Get Attendance by ID
export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance)
      return res.status(404).json({ success: false, message: "Attendance not found" });

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error", error: error.message });
  }
};

// ✅ Update Attendance by ID
export const updateAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, status, dayType, hoursWorked } = req.body;

    const updated = await Attendance.findByIdAndUpdate(
      id,
      { name, date, status, dayType, hoursWorked },
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
    res.status(500).json({ success: false, message: "Error", error: error.message });
  }
};

// ✅ Delete Attendance by ID
export const deleteAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Attendance not found" });

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error", error: error.message });
  }
};
