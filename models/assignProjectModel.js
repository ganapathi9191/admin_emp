import mongoose from 'mongoose';

const projectDetailSchema = new mongoose.Schema({
  projectName: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  comment: { type: String, trim: true },
  hours: { type: Number, required: true },
  shift: { type: String, required: true, trim: true }
}, { _id: false }); // disable _id for subdocuments if not needed

const projectSchema = new mongoose.Schema({
  empId: { type: String, required: true, trim: true },
  employName: { type: String, required: true, trim: true },
  sheet: { 
    type: String, 
    enum: ['frontend', 'backend', 'testing', 'design', 'manager'], 
    required: true 
  },
  projects: {
    type: [projectDetailSchema],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model('AssignProject', projectSchema);
