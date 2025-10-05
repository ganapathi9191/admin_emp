import express from "express";
import { createStaff, getAllStaff,getStaffById,updateStaffById,deleteStaffById } from "../controllers/staffController.js";
import upload from "../utils/multer.js";


const router = express.Router();


router.post("/create_staff", upload.array("documents", 5), createStaff);

// Get all staff with pagination and search
router.get("/get_all_staffs", getAllStaff);

// Get staff by ID
router.get("/staff/:id", getStaffById);

// Update staff by ID
router.put("/update_staff/:id", upload.array("documents", 5),updateStaffById);

// Delete staff by ID
router.delete("/delete_staff/:id", deleteStaffById);
export default router;