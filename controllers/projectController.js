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
