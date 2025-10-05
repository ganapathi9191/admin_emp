import mongoose from 'mongoose';

if (mongoose.models.Project) {
  delete mongoose.models.Project; // 🔹 Remove old cached model
}

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now },
  paymentType: { type: String, enum: ['advance', 'second', 'final'], default: 'advance' },
  status: { type: String, enum: ['completed', 'pending'], default: 'completed' }
});

const projectSchema = new mongoose.Schema({
  projectname: { type: String, required: true, trim: true },
  clientname: { type: String, required: true, trim: true },
  mobilenumber: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  selectcategory: { type: String, required: true, enum: ['mobile app', 'website', 'digital market'], default: 'website' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalprice: { type: Number, required: true, min: 0 },
  advance: { type: Number, required: true, min: 0 },
  paydate: { type: Date, required: true },
  balancepayment: { type: Number, required: true, min: 0 },
  secondpayment: { type: Number, default: 0 },
  payments: [paymentSchema],
  uploadfile: { public_id: String, url: String, originalname: String },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  paymentStatus: { type: String, enum: ['pending', 'partially_paid', 'fully_paid'], default: 'pending' }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;
