import Staff from "../models/staffModel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import multer from "multer";

export const createStaff = async (req, res) => {
    try {
        const { staffId, staffName, mobileNumber, email, role, password } = req.body;

        // Basic validation
        if (!staffId || !staffName || !mobileNumber || !email || !role || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
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

        // Mobile number validation
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobileNumber.replace(/\D/g, ''))) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid 10-digit mobile number"
            });
        }

        // Check for duplicates
        const existingStaff = await Staff.findOne({
            $or: [
                { staffId: staffId.trim() },
                { email: email.toLowerCase().trim() }
            ]
        });

        if (existingStaff) {
            let message = "Staff already exists";
            if (existingStaff.staffId === staffId.trim()) message = "Staff ID already exists";
            else if (existingStaff.email === email.toLowerCase().trim()) message = "Email already exists";

            return res.status(400).json({
                success: false,
                message
            });
        }

        // Upload documents to Cloudinary
        let documents = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const url = await cloudinary.uploadFile(file); // returns string
                    documents.push(url); // directly push URL, no .url
                } catch (uploadError) {
                    console.error("Cloudinary upload error for file:", file.originalname, uploadError);
                }
            }
        }

        // Create staff member
        const newStaff = new Staff({
            staffId: staffId.trim(),
            staffName: staffName.trim(),
            mobileNumber: mobileNumber.trim(),
            email: email.toLowerCase().trim(),
            role: role.trim(),
            password: password, // In production, hash password
            documents // URLs from Cloudinary
        });

        await newStaff.save();

        // Prepare response
        const staffResponse = {
            _id: newStaff._id,
            staffId: newStaff.staffId,
            staffName: newStaff.staffName,
            mobileNumber: newStaff.mobileNumber,
            email: newStaff.email,
            role: newStaff.role,
            documents: newStaff.documents,
            isActive: newStaff.isActive,
            createdAt: newStaff.createdAt,
            updatedAt: newStaff.updatedAt
        };

        res.status(201).json({
            success: true,
            message: "Staff created successfully",
            data: staffResponse
        });

    } catch (error) {
        console.error("Error creating staff:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field === 'staffId' ? 'Staff ID' : 'Email'} already exists`
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
// Get All Staff
export const getAllStaff = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Build search query
        const searchQuery = search ? {
            $or: [
                { staffId: { $regex: search, $options: 'i' } },
                { staffName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } },
                { mobileNumber: { $regex: search, $options: 'i' } }
            ]
        } : {};

        // Sort configuration
        const sortConfig = {};
        sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const staff = await Staff.find(searchQuery)
            .select('-password') // Exclude password
            .sort(sortConfig)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Staff.countDocuments(searchQuery);

        res.status(200).json({
            success: true,
            count: staff.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: staff
        });
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching staff data",
            error: error.message
        });
    }
};

// Get Staff by ID
export const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id).select('-password');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        res.status(200).json({
            success: true,
            data: staff
        });
    } catch (error) {
        console.error("Error fetching staff:", error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid staff ID format"
            });
        }

        res.status(500).json({
            success: false,
            message: "Error fetching staff data",
            error: error.message
        });
    }
};

// Update Staff by ID
export const updateStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const { staffName, mobileNumber, email, role, isActive } = req.body;

        // Build update object
        const updateData = {};
        if (staffName) updateData.staffName = staffName.trim();
        if (mobileNumber) updateData.mobileNumber = mobileNumber.trim();
        if (email) updateData.email = email.toLowerCase().trim();
        if (role) updateData.role = role.trim();
        if (typeof isActive !== 'undefined') updateData.isActive = isActive;

        // Email validation if email is being updated
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address"
                });
            }
        }

        // Mobile validation if mobile is being updated
        if (mobileNumber) {
            const mobileRegex = /^\d{10}$/;
            if (!mobileRegex.test(mobileNumber.replace(/\D/g, ''))) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid 10-digit mobile number"
                });
            }
        }

        // Check for duplicate email if email is being updated
        if (email) {
            const existingStaff = await Staff.findOne({
                email: email.toLowerCase().trim(),
                _id: { $ne: id } // Exclude current staff member
            });

            if (existingStaff) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                });
            }
        }

        const updatedStaff = await Staff.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true, // Return updated document
                runValidators: true // Run model validators
            }
        ).select('-password');

        if (!updatedStaff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Staff updated successfully",
            data: updatedStaff
        });
    } catch (error) {
        console.error("Error updating staff:", error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid staff ID format"
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating staff",
            error: error.message
        });
    }
};

// Delete Staff by ID
export const deleteStaffById = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedStaff = await Staff.findByIdAndDelete(id);

        if (!deletedStaff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        // If you want to delete documents from Cloudinary as well
        // if (deletedStaff.documents && deletedStaff.documents.length > 0) {
        //   for (const docUrl of deletedStaff.documents) {
        //     try {
        //       const publicId = docUrl.split('/').pop().split('.')[0];
        //       await cloudinary.uploader.destroy(`staff-documents/${publicId}`);
        //     } catch (cloudinaryError) {
        //       console.error("Error deleting from Cloudinary:", cloudinaryError);
        //     }
        //   }
        // }

        res.status(200).json({
            success: true,
            message: "Staff deleted successfully",
            data: {
                _id: deletedStaff._id,
                staffId: deletedStaff.staffId,
                staffName: deletedStaff.staffName
            }
        });
    } catch (error) {
        console.error("Error deleting staff:", error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid staff ID format"
            });
        }

        res.status(500).json({
            success: false,
            message: "Error deleting staff",
            error: error.message
        });
    }
};
