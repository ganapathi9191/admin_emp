import Project from "../models/projectModel.js";
import Cloudinary from "../config/cloudinary.js";

export const createProject = async (req, res) => {
  try {
    const {
      projectname,
      clientname,
      mobilenumber,
      email,
      selectcategory,
      startDate,
      endDate,
      totalprice,
      advance,
      paydate,
      balancepayment,
      secondpayment
    } = req.body;

    if (!projectname || !clientname || !mobilenumber || !email || !selectcategory) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Upload file if present
    let uploadfile = null;
    if (req.file && req.file.buffer) {
      try {
        uploadfile = await Cloudinary.uploadFile(req.file);
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Error uploading file",
          error: err.message
        });
      }
    }

    const newProject = new Project({
      projectname,
      clientname,
      mobilenumber,
      email,
      selectcategory,
      startDate,
      endDate,
      totalprice: Number(totalprice),
      advance: Number(advance),
      paydate,
      balancepayment: Number(balancepayment),
      secondpayment: Number(secondpayment),
      uploadfile
    });

    await newProject.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: "Validation error", errors });
    }
    res.status(500).json({ success: false, message: "Error creating project", error: err.message });
  }
};

// GET ALL PROJECTS
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching projects", error: err.message });
  }
};

// GET PROJECT BY ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching project", error: err.message });
  }
};

// UPDATE PROJECT BY ID
export const updateProjectById = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Upload file if new file is present
    if (req.file && req.file.buffer) {
      try {
        updateData.uploadfile = await Cloudinary.uploadFile(req.file);
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Error uploading file",
          error: err.message
        });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Project updated successfully", data: updatedProject });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: "Validation error", errors });
    }
    res.status(500).json({ success: false, message: "Error updating project", error: err.message });
  }
};

// DELETE PROJECT BY ID
export const deleteProjectById = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, message: "Project deleted successfully", data: deletedProject });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting project", error: err.message });
  }
};
