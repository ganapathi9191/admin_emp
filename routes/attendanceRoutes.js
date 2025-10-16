import express from "express";
import {
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendanceById,
  deleteAttendanceById,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/attendance", createAttendance);
router.get("/attendance", getAllAttendance);
router.get("/attendance/:id", getAttendanceById);
router.put("/attendance/:id", updateAttendanceById);
router.delete("/attendance/:id", deleteAttendanceById);

export default router;
