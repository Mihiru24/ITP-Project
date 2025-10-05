const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['pdf', 'virtual_book', 'video'], required: true },
  fileUrl: String,      // for uploaded PDFs
  driveLink: String,    // for Google Drive link (PDF or video)
  content: String,      // for virtual books (HTML/text)
  tag: { type: String, required: true }, // dynamic category
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views: { type: Number, default: 0 },
}, { timestamps: true });


module.exports = mongoose.model('Resource', resourceSchema);

//----------------------------------------------------------------------------------------

// const mongoose = require('mongoose');

// const resourceSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: String,
//   type: { type: String, enum: ['pdf', 'virtual_book', 'video'], required: true },
//   fileUrl: String,      // for uploaded PDFs
//   driveLink: String,    // for Google Drive link (PDF or video)
//   content: String,      // for virtual books (HTML/text)
//   tag: { type: String, required: true }, // dynamic category
//   tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   views: { type: Number, default: 0 },
  
//   // NEW FIELDS FOR VIRTUAL BOOK PROTECTION
//   fileName: String,           // Original file name
//   fileSize: Number,           // File size in bytes
//   fileType: String,           // MIME type (application/pdf, application/epub+zip, etc.)
//   preventScreenshot: {        // Enable screen capture protection
//     type: Boolean, 
//     default: false 
//   },
//   accessKey: String,          // Unique key for secure access
//   watermark: {                // User-specific watermarking
//     enabled: { type: Boolean, default: false },
//     text: String,             // Custom watermark text
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
//   },
//   expiration: Date,           // Content expiration date
//   maxViews: { type: Number, default: null }, // Maximum number of views allowed
//   allowedUsers: [{            // Restrict to specific users
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User' 
//   }],
//   downloadDisabled: {         // Disable downloading
//     type: Boolean, 
//     default: false 
//   },
//   securityLog: [{             // Track access attempts
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     accessedAt: { type: Date, default: Date.now },
//     action: String,           // 'view', 'download_attempt', 'screenshot_attempt'
//     ipAddress: String,
//     userAgent: String
//   }]
// }, { 
//   timestamps: true 
// });

// // Index for better performance on security-related queries
// resourceSchema.index({ 
//   'accessKey': 1, 
//   'preventScreenshot': 1, 
//   'expiration': 1 
// });

// // Virtual for checking if resource is expired
// resourceSchema.virtual('isExpired').get(function() {
//   return this.expiration && this.expiration < new Date();
// });

// // Virtual for checking if view limit is reached
// resourceSchema.virtual('isViewLimitReached').get(function() {
//   return this.maxViews && this.views >= this.maxViews;
// });

// // Method to check if user has access
// resourceSchema.methods.canAccess = function(userId) {
//   if (this.isExpired) return false;
//   if (this.isViewLimitReached) return false;
//   if (this.allowedUsers.length > 0 && !this.allowedUsers.includes(userId)) return false;
//   return true;
// };

// // Method to log security events
// resourceSchema.methods.logSecurityEvent = function(eventData) {
//   // Keep only the last 100 events to prevent unbounded growth
//   if (this.securityLog.length >= 100) {
//     this.securityLog.shift();
//   }
  
//   this.securityLog.push(eventData);
//   return this.save();
// };

// // Pre-save middleware to generate access key for protected resources
// resourceSchema.pre('save', function(next) {
//   if (this.preventScreenshot && !this.accessKey) {
//     this.accessKey = require('crypto').randomBytes(16).toString('hex');
//   }
//   next();
// });

// module.exports = mongoose.model('Resource', resourceSchema);
