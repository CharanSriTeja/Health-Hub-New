const LabReport = require('../models/LabReport');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/lab-reports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed!'));
    }
  }
}).single('reportFile');

// Get all lab reports for a user
const getAllLabReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, startDate, endDate, search } = req.query;
    const userId = req.user._id;

    let query = { user: userId };

    // Add filters
    if (type) query.type = new RegExp(type, 'i');
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { labName: new RegExp(search, 'i') },
        { notes: new RegExp(search, 'i') }
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const labReports = await LabReport.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LabReport.countDocuments(query);

    res.json({
      labReports,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get lab report by ID
const getLabReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const labReport = await LabReport.findOne({ _id: id, user: userId });

    if (!labReport) {
      return res.status(404).json({ error: 'Lab report not found' });
    }

    res.json(labReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new lab report
const createLabReport = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const labReportData = {
        ...req.body,
        user: req.user._id
      };

      if (req.file) {
        labReportData.filePath = req.file.path;
        labReportData.fileName = req.file.originalname;
        labReportData.fileSize = req.file.size;
        labReportData.fileType = req.file.mimetype;
      }

      const labReport = new LabReport(labReportData);
      await labReport.save();

      res.status(201).json(labReport);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update lab report
const updateLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const updateData = { ...req.body };

      if (req.file) {
        updateData.filePath = req.file.path;
        updateData.fileName = req.file.originalname;
        updateData.fileSize = req.file.size;
        updateData.fileType = req.file.mimetype;
      }

      const labReport = await LabReport.findOneAndUpdate(
        { _id: id, user: userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!labReport) {
        return res.status(404).json({ error: 'Lab report not found' });
      }

      res.json(labReport);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete lab report
const deleteLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const labReport = await LabReport.findOne({ _id: id, user: userId });

    if (!labReport) {
      return res.status(404).json({ error: 'Lab report not found' });
    }

    // Delete the file if it exists
    if (labReport.filePath && fs.existsSync(labReport.filePath)) {
      fs.unlinkSync(labReport.filePath);
    }

    await LabReport.findByIdAndDelete(id);

    res.json({ message: 'Lab report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download lab report file
const downloadLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const labReport = await LabReport.findOne({ _id: id, user: userId });

    if (!labReport) {
      return res.status(404).json({ error: 'Lab report not found' });
    }

    if (!labReport.filePath || !fs.existsSync(labReport.filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(labReport.filePath, labReport.fileName || 'lab-report');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// View lab report file
const viewLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const labReport = await LabReport.findOne({ _id: id, user: userId });

    if (!labReport) {
      return res.status(404).json({ error: 'Lab report not found' });
    }

    if (!labReport.filePath || !fs.existsSync(labReport.filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileStream = fs.createReadStream(labReport.filePath);
    res.setHeader('Content-Type', labReport.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${labReport.fileName}"`);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get lab report statistics
const getLabReportStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await LabReport.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          totalFileSize: { $sum: '$fileSize' },
          latestReport: { $max: '$date' }
        }
      }
    ]);

    const typeStats = await LabReport.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgFileSize: { $avg: '$fileSize' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const labStats = await LabReport.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$labName',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      overall: stats[0] || {
        totalReports: 0,
        totalFileSize: 0,
        latestReport: null
      },
      byType: typeStats,
      byLab: labStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Share lab report
const shareLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, permissions } = req.body;
    const userId = req.user._id;

    const labReport = await LabReport.findOne({ _id: id, user: userId });

    if (!labReport) {
      return res.status(404).json({ error: 'Lab report not found' });
    }

    // Add sharing logic here (could involve creating a share token or sending email)
    // For now, we'll just return a success message
    res.json({ 
      message: 'Lab report shared successfully',
      shareUrl: `${process.env.FRONTEND_URL}/shared-lab-report/${id}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllLabReports,
  getLabReportById,
  createLabReport,
  updateLabReport,
  deleteLabReport,
  downloadLabReport,
  viewLabReport,
  getLabReportStats,
  shareLabReport
};
