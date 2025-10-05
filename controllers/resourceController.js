// const mongoose = require('mongoose'); // Add this import at the top
// const Resource = require('../models/Resource');
// const UsageLog = require('../models/UsageLog');
// const exportPDF = require('../utils/exportPDF');

// exports.addResource = async (req, res) => {
//   try {
//     const { title, description, type, driveLink, content, tag } = req.body;
//     const file = req.file;

//     // Validation
//     if (!title || !type || !tag) {
//       return res.status(400).json({ message: 'Title, type, and tag are required' });
//     }
//     if (type === 'pdf' && !file) {
//       return res.status(400).json({ message: 'PDF file required for type "pdf"' });
//     }
//     if (type === 'video' && !driveLink) {
//       return res.status(400).json({ message: 'Drive link required for type "video"' });
//     }
//     if (type === 'virtual_book' && !content) {
//       return res.status(400).json({ message: 'Content required for type "virtual_book"' });
//     }

//     const resource = await Resource.create({
//       title,
//       description,
//       type,
//       fileUrl: file ? `/uploads/${file.filename}` : null,
//       driveLink: type === 'video' ? driveLink : null,
//       content: type === 'virtual_book' ? content : null,
//       tag,
//       tutorId: new mongoose.Types.ObjectId(),
//       views: 0,
//     });

//     // Log upload action with default user
//     await UsageLog.create({
//       resourceId: resource._id,
//       userId: new mongoose.Types.ObjectId(),
//       action: 'upload',
//     });

//     res.status(201).json({ message: 'Resource uploaded successfully', resource });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error uploading resource', error: err.message });
//   }
// };

// exports.getResources = async (req, res) => {
//   try {
//     const { search, tag } = req.query;
//     let query = {};

//     if (search) query.title = { $regex: search, $options: 'i' };
//     if (tag) query.tag = tag;

//     const resources = await Resource.find(query);
//     res.json(resources);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching resources', error: err.message });
//   }
// };

// exports.viewResource = async (req, res) => {
//   try {
//     const resource = await Resource.findById(req.params.id);
//     if (!resource) return res.status(404).json({ message: 'Resource not found' });

//     resource.views += 1;
//     await resource.save();

//     await UsageLog.create({
//       resourceId: resource._id,
//       userId: new mongoose.Types.ObjectId(), // Use new ObjectId instead of req.user._id
//       action: 'view',
//     });

//     res.json(resource);
//   } catch (err) {
//     res.status(500).json({ message: 'Error viewing resource', error: err.message });
//   }
// };

// exports.deleteResource = async (req, res) => {
//   try {
//     const resource = await Resource.findById(req.params.id);
//     if (!resource) return res.status(404).json({ message: 'Not found' });

//     // Remove authorization check since we don't have authentication
//     await resource.deleteOne();
//     res.json({ message: 'Resource deleted' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error deleting resource', error: err.message });
//   }
// };

// exports.exportReport = async (req, res) => {
//   try {
//     const resources = await Resource.find();
//     exportPDF(resources, res);
//   } catch (err) {
//     res.status(500).json({ message: 'Error exporting report', error: err.message });
//   }
// };


// exports.updateResource = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, type, driveLink, content, tag } = req.body;

//     const resource = await Resource.findByIdAndUpdate(
//       id,
//       { title, description, type, driveLink, content, tag },
//       { new: true, runValidators: true }
//     );

//     if (!resource) {
//       return res.status(404).json({ message: 'Resource not found' });
//     }

//     res.json({ message: 'Resource updated successfully', resource });
//   } catch (err) {
//     console.error('Update error:', err);
//     res.status(500).json({ message: 'Error updating resource', error: err.message });
//   }
// };

//-------------------------------------------------------------------------------------------------------------------------------------

const mongoose = require('mongoose'); 
const Resource = require('../models/Resource'); 
const UsageLog = require('../models/UsageLog'); 
const exportPDF = require('../utils/exportPDF');
const exportExcel = require('../utils/exportExcel'); 

// ================== ADD RESOURCE ==================
exports.addResource = async (req, res) => {
  try {
    const { title, description, type, driveLink, content, tag } = req.body; // Extract fields from request body
    const file = req.file; // Uploaded file (if any)

    // ---------- Validation ----------
    if (!title || !type || !tag) {
      return res.status(400).json({ message: 'Title, type, and tag are required' });
    }
    if (type === 'pdf' && !file) {
      return res.status(400).json({ message: 'PDF file required for type "pdf"' });
    }
    if (type === 'video' && !driveLink) {
      return res.status(400).json({ message: 'Drive link required for type "video"' });
    }
    if (type === 'virtual_book' && !content) {
      return res.status(400).json({ message: 'Content required for type "virtual_book"' });
    }

    // ---------- Create resource ----------
    const resource = await Resource.create({
      title,
      description,
      type,
      fileUrl: file ? `/uploads/${file.filename}` : null, // Store file path if uploaded
      driveLink: type === 'video' ? driveLink : null, // Save link if video
      content: type === 'virtual_book' ? content : null, // Save content if virtual book
      tag,
      tutorId: new mongoose.Types.ObjectId(), // Placeholder tutor ID (can link with user later)
      views: 0, // Initialize view count
    });

    // ---------- Log usage ----------
    await UsageLog.create({
      resourceId: resource._id,
      userId: new mongoose.Types.ObjectId(), // Placeholder user ID
      action: 'upload', // Action type
    });

    res.status(201).json({ message: 'Resource uploaded successfully', resource });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading resource', error: err.message });
  }
};

// ================== GET RESOURCES ==================
exports.getResources = async (req, res) => {
  try {
    const { search, tag } = req.query; // Get search and tag filters
    let query = {};

    // ---------- Filtering ----------
    if (search) query.title = { $regex: search, $options: 'i' }; // Case-insensitive title search
    if (tag) query.tag = tag; // Filter by tag

    const resources = await Resource.find(query); // Fetch from DB
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching resources', error: err.message });
  }
};

// ================== VIEW RESOURCE ==================
exports.viewResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id); // Find resource by ID
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    // ---------- Update views ----------
    resource.views += 1; // Increment views
    await resource.save();

    // ---------- Log usage ----------
    await UsageLog.create({
      resourceId: resource._id,
      userId: new mongoose.Types.ObjectId(), // Placeholder user ID
      action: 'view', // Action type
    });

    // Set headers for PDF files to enable viewing in browser
    if (resource.type === 'pdf' && resource.fileUrl) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }

    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Error viewing resource', error: err.message });
  }
};

// ================== DELETE RESOURCE ==================
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id); // Find resource
    if (!resource) return res.status(404).json({ message: 'Not found' });

    // ---------- Delete resource ----------
    await resource.deleteOne();
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting resource', error: err.message });
  }
};

// ================== EXPORT REPORT ==================
exports.exportReport = async (req, res) => {
  try {
    const resources = await Resource.find(); // Get all resources
    exportPDF(resources, res); // Generate PDF report
  } catch (err) {
    res.status(500).json({ message: 'Error exporting report', error: err.message });
  }
};

// ================== UPDATE RESOURCE ==================
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params; // Resource ID from params
    const { title, description, type, driveLink, content, tag } = req.body; // Fields to update

    // ---------- Update resource ----------
    const resource = await Resource.findByIdAndUpdate(
      id,
      { title, description, type, driveLink, content, tag },
      { new: true, runValidators: true } // Return updated doc and validate
    );

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ message: 'Resource updated successfully', resource });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Error updating resource', error: err.message });
  }
};

// ================== EXPORT EXCEL REPORT ==================
exports.exportExcelReport = async (req, res) => {
  try {
    const resources = await Resource.find(); // Get all resources
    exportExcel(resources, res); // Generate Excel report
  } catch (err) {
    res.status(500).json({ message: 'Error exporting Excel report', error: err.message });
  }
};
