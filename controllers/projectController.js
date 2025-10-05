import Project from "../models/projectModel.js";
import Cloudinary from "../config/cloudinary.js";

// CREATE PROJECT
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
      secondpayment,
      status // added status field
    } = req.body;

    if (!projectname || !clientname || !mobilenumber || !email || !selectcategory) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let uploadfile = null;
    if (req.file && req.file.buffer) {
      try {
        uploadfile = await Cloudinary.uploadFile(req.file);
      } catch (err) {
        return res.status(500).json({ success: false, message: "Error uploading file", error: err.message });
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
      uploadfile,
      status: status || "pending"
    });

    await newProject.save();

    res.status(201).json({ success: true, message: "Project created successfully", data: newProject });

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
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching project", error: err.message });
  }
};

// UPDATE WHOLE PROJECT
export const updateProjectById = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle file upload if provided
    if (req.file && req.file.buffer) {
      try {
        updateData.uploadfile = await Cloudinary.uploadFile(req.file);
      } catch (err) {
        return res.status(500).json({ success: false, message: "Error uploading file", error: err.message });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedProject) return res.status(404).json({ success: false, message: "Project not found" });

    res.status(200).json({ success: true, message: "Project updated successfully", data: updatedProject });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: "Validation error", errors });
    }
    res.status(500).json({ success: false, message: "Error updating project", error: err.message });
  }
};

// GET PROJECT COUNTS BY CATEGORY
export const getProjectCounts = async (req, res) => {
  try {
    // Aggregate counts by selectcategory
    const categoryCounts = await Project.aggregate([
      {
        $group: {
          _id: "$selectcategory",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format as key-value pairs
    const counts = {
      "mobile app": 0,
      "website": 0,
      "digital market": 0
    };

    categoryCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    // Total projects
    const totalProjects = await Project.countDocuments();

    res.status(200).json({
      success: true,
      totalProjects,
      categoryCounts: counts
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching project counts", error: err.message });
  }
};

// UPDATE ONLY STATUS
export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "Status is required" });

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedProject) return res.status(404).json({ success: false, message: "Project not found" });

    res.status(200).json({ success: true, message: "Project status updated successfully", data: updatedProject });

  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating project status", error: err.message });
  }
};


// UPDATE PAYMENT INFO / PAYMENT STATUS
export const updateProjectPayment = async (req, res) => {
  try {
    const { totalprice, advance, balancepayment, secondpayment, paydate, paymentStatus } = req.body;

    // Ensure at least one field is provided
    if (
      totalprice === undefined &&
      advance === undefined &&
      balancepayment === undefined &&
      secondpayment === undefined &&
      paydate === undefined &&
      paymentStatus === undefined
    ) {
      return res.status(400).json({ success: false, message: "No payment data provided" });
    }

    const updateData = {};
    if (totalprice !== undefined) updateData.totalprice = Number(totalprice);
    if (advance !== undefined) updateData.advance = Number(advance);
    if (balancepayment !== undefined) updateData.balancepayment = Number(balancepayment);
    if (secondpayment !== undefined) updateData.secondpayment = Number(secondpayment);
    if (paydate) updateData.paydate = paydate;
    if (paymentStatus) updateData.paymentStatus = paymentStatus; // pending, partially_paid, fully_paid

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProject) return res.status(404).json({ success: false, message: "Project not found" });

    res.status(200).json({
      success: true,
      message: "Project payment info updated successfully",
      data: updatedProject
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating payment info", error: err.message });
  }
};

// DELETE PROJECT BY ID
export const deleteProjectById = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, message: "Project deleted successfully", data: deletedProject });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting project", error: err.message });
  }
};