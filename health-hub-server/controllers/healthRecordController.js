const HealthRecord = require('../models/HealthRecord');

// Get all health records for a user
const getAllHealthRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, startDate, endDate, search } = req.query;
    const userId = req.user._id;

    let query = { user: userId };

    // Add filters
    if (type) query.type = new RegExp(type, 'i');
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { type: new RegExp(search, 'i') },
        { notes: new RegExp(search, 'i') }
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const healthRecords = await HealthRecord.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HealthRecord.countDocuments(query);

    res.json({
      healthRecords,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get health record by ID
const getHealthRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const healthRecord = await HealthRecord.findOne({ _id: id, user: userId });

    if (!healthRecord) {
      return res.status(404).json({ error: 'Health record not found' });
    }

    res.json(healthRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new health record
const createHealthRecord = async (req, res) => {
  try {
    const healthRecordData = {
      ...req.body,
      user: req.user._id
    };

    const healthRecord = new HealthRecord(healthRecordData);
    await healthRecord.save();

    res.status(201).json(healthRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update health record
const updateHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const healthRecord = await HealthRecord.findOneAndUpdate(
      { _id: id, user: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!healthRecord) {
      return res.status(404).json({ error: 'Health record not found' });
    }

    res.json(healthRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete health record
const deleteHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const healthRecord = await HealthRecord.findOneAndDelete({ _id: id, user: userId });

    if (!healthRecord) {
      return res.status(404).json({ error: 'Health record not found' });
    }

    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get health record statistics
const getHealthRecordStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await HealthRecord.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          avgValue: { $avg: '$value' },
          latestRecord: { $max: '$date' }
        }
      }
    ]);

    const typeStats = await HealthRecord.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgValue: { $avg: '$value' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const statusStats = await HealthRecord.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overall: stats[0] || {
        totalRecords: 0,
        avgValue: 0,
        latestRecord: null
      },
      byType: typeStats,
      byStatus: statusStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Share health record
const shareHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, permissions } = req.body;
    const userId = req.user._id;

    const healthRecord = await HealthRecord.findOne({ _id: id, user: userId });

    if (!healthRecord) {
      return res.status(404).json({ error: 'Health record not found' });
    }

    // Add sharing logic here (could involve creating a share token or sending email)
    // For now, we'll just return a success message
    res.json({ 
      message: 'Health record shared successfully',
      shareUrl: `${process.env.FRONTEND_URL}/shared-record/${id}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export health records
const exportHealthRecords = async (req, res) => {
  try {
    const userId = req.user._id;
    const { format = 'json' } = req.query;

    const healthRecords = await HealthRecord.find({ user: userId }).sort({ date: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = healthRecords.map(record => ({
        type: record.type,
        value: record.value,
        unit: record.unit,
        date: record.date,
        status: record.status,
        notes: record.notes
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=health-records.csv');
      
      // Simple CSV conversion
      const csv = [
        'Type,Value,Unit,Date,Status,Notes',
        ...csvData.map(row => 
          `"${row.type}","${row.value}","${row.unit}","${row.date}","${row.status}","${row.notes}"`
        )
      ].join('\n');
      
      res.send(csv);
    } else {
      res.json(healthRecords);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllHealthRecords,
  getHealthRecordById,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getHealthRecordStats,
  shareHealthRecord,
  exportHealthRecords
};
