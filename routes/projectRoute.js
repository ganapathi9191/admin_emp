import express from "express";
import upload from "../utils/multer.js";
import { createProject } from "../controllers/projectController.js";

const router = express.Router();

// Single file upload
router.post("/projects", upload.single("uploadfile"), createProject);

export default router;
