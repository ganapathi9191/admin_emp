import express from "express";
import {
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  getAttendanceByStaffId,
  updateAttendanceById,
  deleteAttendanceById,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/create-attendance", createAttendance);
router.get("/getall-attendance", getAllAttendance);
router.get("/attendance/:id", getAttendanceById);
router.get("/attendance/staff/:staffId", getAttendanceByStaffId);
router.put("/attendance/:id", updateAttendanceById);
router.delete("/attendance/:id", deleteAttendanceById);

export default router;
