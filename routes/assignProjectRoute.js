import express from 'express';
import {
  createProject,
  getAllEmployeeProjects,
  getEmployeeProjectById,
  updateEmployeeProjectById,
  deleteEmployeeProjectById
} from '../controllers/assignProjectController.js';

const router = express.Router();

// Create a new project
router.post('/assign_project', createProject);

// Get all projects
router.get('/all_assign_projects', getAllEmployeeProjects);

// Get single project by ID
router.get('/get_assign_project/:id', getEmployeeProjectById);

// Update project by ID
router.put('/update_assign_project/:id', updateEmployeeProjectById);

// Delete project by ID
router.delete('delete_assign_project/:id', deleteEmployeeProjectById);

export default router;