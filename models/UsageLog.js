const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['upload', 'view', 'download'], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UsageLog', usageLogSchema);