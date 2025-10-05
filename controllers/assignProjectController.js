import Project from '../models/assignProjectModel.js';

// Create new project
export const createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// -----------------------
// Get All Employee Projects
// -----------------------
export const getAllEmployeeProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error("Get All Projects Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// -----------------------
// Get Employee Project By ID
// -----------------------
export const getEmployeeProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error("Get Project By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// -----------------------
// Update Employee Project By ID
// -----------------------
export const updateEmployeeProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { empId, employName, sheet, projects } = req.body;

    const updateData = {};
    if (empId) updateData.empId = empId;
    if (employName) updateData.employName = employName;
    if (sheet) updateData.sheet = sheet;
    if (projects) updateData.projects = projects;

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject
    });
  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// -----------------------
// Delete Employee Project By ID
// -----------------------
export const deleteEmployeeProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: deletedProject
    });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};