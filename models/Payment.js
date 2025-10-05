const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  adminCommission: {
    type: Number,
    default: 0
  },
  teacherPayment: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
