import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medicines: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
  }],
  notes: String,
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active',
  },
  validUntil: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);