const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['teacher', 'student', 'admin', 'library', 'manager'],
    required: true
  },
  fullName: { type: String, required: true },
  userName: { type: String }, // for students
  nic: { type: String }, // for teachers
  subject: { type: String }, // for teachers
  about: { type: String }, // for teachers
  bankName: { type: String }, // for teachers
  accountNumber: { type: String }, // for teachers
  branch: { type: String }, // for teachers
  beneficiaryName: { type: String }, // for teachers
  dob: { type: Date }, // for students
  address: { type: String }, // for students
  phone: { type: String }, // for students
  isClassStudent: { type: String, enum: ['yes', 'no'] }, // for students
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
