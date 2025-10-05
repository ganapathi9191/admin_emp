import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  staffId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  staffName: { 
    type: String, 
    required: true,
    trim: true
  },
  mobileNumber: { 
    type: String, 
    required: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true
  },
  documents: [{ 
    type: String 
  }], // Cloudinary URLs
  role: { 
    type: String, 
    required: true
  },
  password: { 
    type: String, 
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;