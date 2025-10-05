import express from "express";
import upload from "../utils/multer.js";
import {   createProject,
  getAllProjects,
  getProjectById,
  updateProjectById,
  getProjectCounts,
  updateProjectStatus,
  updateProjectPayment,
  deleteProjectById } from "../controllers/projectController.js";

const router = express.Router();

// Single file upload
router.post("/projects", upload.single("uploadfile"), createProject);
// GET ALL PROJECTS
router.get("/projects", getAllProjects);

// GET PROJECT BY ID
router.get("/project/:id", getProjectById);

// GET project counts by category
router.get("/counts", getProjectCounts);


// UPDATE PROJECT BY ID
router.put("/project/:id", upload.single("file"), updateProjectById);

// UPDATE ONLY STATUS (PATCH)
router.patch("/:id/status", updateProjectStatus);

// UPDATE PAYMENT INFO / STATUS
router.patch("/payment/:id", updateProjectPayment);


// DELETE PROJECT BY ID
router.delete("/project/:id", deleteProjectById);


export default router;
