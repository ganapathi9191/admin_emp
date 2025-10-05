import Admin from "../models/adminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { adminName, email, password } = req.body;

    // Validation - Check if all required fields are provided
    if (!adminName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Admin name, email and password are required"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Verify admin name matches
    if (admin.adminName !== adminName.trim()) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin name or password"
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id,
        adminName: admin.adminName,
        email: admin.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Prepare response data (exclude password)
    const adminResponse = {
      _id: admin._id,
      adminName: admin.adminName,
      email: admin.email,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: adminResponse
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};